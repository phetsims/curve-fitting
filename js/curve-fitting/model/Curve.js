// Copyright 2015, University of Colorado Boulder

/**
 * Curve model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var FitMaker = require( 'CURVE_FITTING/curve-fitting/model/FitMaker' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  // set default adjustable values
  function setDefaultAdjustableValues( obj ) {
    obj.a = 0;
    obj.b = 0;
    obj.c = 0;
    obj.d = 2.7;
  }

  /**
   * @param {Property.<number>} orderOfFitProperty - Property to control curve type.
   * @param {Property.<string>} fitTypeProperty - Property to control fit type.
   * @constructor
   */
  function Curve( orderOfFitProperty, fitTypeProperty ) {
    var self = this;

    PropertySet.call( this, {
      isVisible: false, // curve flag visibility
      a: 0, // parameter with x^3
      b: 0, // parameter with x^2
      c: 0, // parameter with x^1
      d: 0, // parameter with constant
      chiSquare: 0, // x^2 deviation value
      rSquare: 0 // r^2 deviation value
    } );

    // property for storing calculation result
    this.yDeviationSquaredSum = 0;

    // save link to property
    this._orderOfFitProperty = orderOfFitProperty;
    this._fitTypeProperty = fitTypeProperty;

    // Contains points for plotting curve. Only point above graph will be taken for calculations. Order doesn't matter.
    this.points = new ObservableArray();

    // special object to getting fit for points
    this.fitMaker = new FitMaker();

    this._updateFitBinded = this.updateFit.bind( this ); // @private

    this.points.addListeners( this.addPoint.bind( this ), this.removePoint.bind( this ) );

    orderOfFitProperty.lazyLink( function( orderOfFit ) {
      // store the value of a for later use
      if ( orderOfFit < 3 ) {
        self._storage.a = self.a;
        self.a = 0;
      }
      else { // set the value of a to what it was previously
        self.a = self._storage.a;
      }

      // store the value of b for later use
      if ( orderOfFit < 2 ) {
        self._storage.b = self.b;
        self.b = 0;
      }
      else { // set the value to what it was previously
        self.b = self._storage.b;
      }


      self.updateFit();
    } );

    // Storage necessary to store and restore user's adjustable values on call.
    // Values are putting into storage when user switch to "Best fit". If after that user switch back "Adjustable fit" (without turn on/off
    // "Curve" between operations) adjustable values will be restored from storage. If "Curve" is turn off then storage values is flush.
    this._storage = {}; // @private
    setDefaultAdjustableValues( this._storage );
    this.isVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        self.updateFit();
      }
      else if ( fitTypeProperty.value === FitType.BEST ) {
        // flush storage values
        setDefaultAdjustableValues( self._storage );
      }
      else if ( fitTypeProperty.value === FitType.ADJUSTABLE ) {
        // set default values
        setDefaultAdjustableValues( self );
      }
    } );

    this.aProperty.lazyLink( this._updateFitBinded );
    this.bProperty.lazyLink( this._updateFitBinded );
    this.cProperty.lazyLink( this._updateFitBinded );
    this.dProperty.lazyLink( this._updateFitBinded );
    fitTypeProperty.lazyLink( function( fitTypeNew, fitTypePrev ) {
      if ( fitTypeNew === FitType.BEST ) {
        if ( fitTypePrev === FitType.ADJUSTABLE ) {
          // save adjustable values in storage
          self.saveValuesToStorage();
        }

        self.updateFit();
        self.trigger( 'update' );
      }
      else if ( fitTypeNew === FitType.ADJUSTABLE ) {
        // restore adjustable values from storage
        self.restoreValuesFromStorage();
        self.trigger( 'update' );
      }
    } );
  }

  curveFitting.register( 'Curve', Curve );

  return inherit( PropertySet, Curve, {

    // add point to curve
    addPoint: function( point ) {
      var self = this;

      point.on( 'updateXY', this._updateFitBinded );
      point.isInsideGraphProperty.lazyLink( this._updateFitBinded );
      point.deltaProperty.link( this._updateFitBinded );

      // remove points when they have returned to the bucket 
      point.on( 'returnedToOrigin', function() {
        self.points.remove( point );
      } );
    },

    // return deviation sum for all points
    computeSum: function() {
      var points = this.getPoints();
      var sum = 0;
      var yApproximated;
      var yDeviationSquared;
      var x;
      var y;

      this.yDeviationSquaredSum = 0;
      for ( var i = 0; i < points.length; ++i ) {
        y = points[ i ].position.y;
        x = points[ i ].position.x;
        yApproximated = this.d + this.c * x + this.b * x * x + this.a * x * x * x;
        yDeviationSquared = ( y - yApproximated ) * ( y - yApproximated );
        sum = sum + yDeviationSquared / ( points[ i ].delta * points[ i ].delta );
        this.yDeviationSquaredSum += yDeviationSquared;
      }

      return sum;
    },

    // select points inside graph area
    getPoints: function() {
      return this.points.getArray().filter( function( point ) {
        return point.isInsideGraph;
      } );
    },

    // remove point from curve
    removePoint: function( point ) {
      point.off( 'updateXY', this._updateFitBinded );
      point.isInsideGraphProperty.unlink( this._updateFitBinded );
      point.deltaProperty.unlink( this._updateFitBinded );
      this.updateFit();
    },

    reset: function() {
      PropertySet.prototype.reset.call( this );

      this.yDeviationSquaredSum = 0;
      setDefaultAdjustableValues( this._storage );
      this.points.clear();
    },

    // set r^2-deviation for current point
    setRSquared: function() {
      var points = this.getPoints();
      var rSquare;
      var ySum = 0;
      var yDelta = 0;
      var yDeviation;
      var pointsLength = points.length;

      for ( var i = 0; i < pointsLength; ++i ) {
        ySum = ySum + points[ i ].position.y;
      }

      ySum = ySum / pointsLength;

      for ( i = 0; i < pointsLength; ++i ) {
        yDeviation = points[ i ].position.y - ySum;
        yDelta = yDelta + yDeviation * yDeviation;
      }

      rSquare = 1 - this.yDeviationSquaredSum / yDelta;

      if ( rSquare < 0 || isNaN( rSquare ) ) {
        this.rSquare = 0;
      }
      else {
        this.rSquare = rSquare;
      }
    },

    // set x^2-deviation for current point
    setReducedChiSquare: function() {
      var points = this.getPoints();
      var orderOfFit = this._orderOfFitProperty.value;
      var degOfFreedom = points.length - orderOfFit - 1;

      if ( points.length > orderOfFit + 1 ) {
        this.chiSquare = this.computeSum() / degOfFreedom;
      }
      else {
        this.chiSquare = 0;
      }
    },

    // save values to storage. Necessary when switch to adjustable mode
    saveValuesToStorage: function() {
      this._storage.a = this.a;
      this._storage.b = this.b;
      this._storage.c = this.c;
      this._storage.d = this.d;
    },

    // restore values from storage. Necessary when switching back from adjustable mode
    restoreValuesFromStorage: function() {
      this.a = this._storage.a;
      this.b = this._storage.b;
      this.c = this._storage.c;
      this.d = this._storage.d;
    },

    // update fit for current points
    updateFit: function() {
      // update only when curve visible
      if ( this.isVisible ) {
        if ( this._fitTypeProperty.value === FitType.BEST ) {
          var fit = this.fitMaker.getFit( this.getPoints(), this._orderOfFitProperty.value );

          this.d = isFinite( fit[ 0 ] ) ? fit[ 0 ] : 0;
          this.c = isFinite( fit[ 1 ] ) ? fit[ 1 ] : 0;
          this.b = isFinite( fit[ 2 ] ) ? fit[ 2 ] : 0;
          this.a = isFinite( fit[ 3 ] ) ? fit[ 3 ] : 0;
        }

        this.setReducedChiSquare();
        this.setRSquared();
        this.trigger( 'update' );
      }
    }
  } );
} );