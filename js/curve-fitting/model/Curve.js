// Copyright 2002-2014, University of Colorado Boulder

/**
 * Curve model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var FitMaker = require( 'CURVE_FITTING/curve-fitting/model/FitMaker' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  // constants
  var A_DEFAULT_ADJUSTABLE_VALUE = 0;
  var B_DEFAULT_ADJUSTABLE_VALUE = 0;
  var C_DEFAULT_ADJUSTABLE_VALUE = 0;
  var D_DEFAULT_ADJUSTABLE_VALUE = 2.7;

  function setDefaultAdjustableValues( obj ) {
    obj.a = A_DEFAULT_ADJUSTABLE_VALUE;
    obj.b = B_DEFAULT_ADJUSTABLE_VALUE;
    obj.c = C_DEFAULT_ADJUSTABLE_VALUE;
    obj.d = D_DEFAULT_ADJUSTABLE_VALUE;
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

    // points for plotting curve
    this.points = new ObservableArray();

    // special object to getting fit for points
    this.fitMaker = new FitMaker();

    this._updateFitBinded = this.updateFit.bind( this );

    this.points.addListeners( this.addPoint.bind( this ), this.removePoint.bind( this ) );

    orderOfFitProperty.lazyLink( function( orderOfFit ) {
      if ( orderOfFit < 3 ) {
        self.a = 0;
        self._storage.a = 0;

        if ( orderOfFit < 2 ) {
          self.b = 0;
          self._storage.b = 0;
        }
      }

      self.updateFit();
    } );

    this._storage = {};
    setDefaultAdjustableValues( this._storage );
    this.isVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        self.updateFit();
      }
      else if ( fitTypeProperty.value === FitType.BEST ) {
        setDefaultAdjustableValues( self._storage );
      }
      else if ( fitTypeProperty.value === FitType.ADJUSTABLE ) {
        setDefaultAdjustableValues( self );
      }
    } );

    this.aProperty.lazyLink( this._updateFitBinded );
    this.bProperty.lazyLink( this._updateFitBinded );
    this.cProperty.lazyLink( this._updateFitBinded );
    this.dProperty.lazyLink( this._updateFitBinded );
    fitTypeProperty.lazyLink( function( fitTypeNew, fitTypePrev ) {
      if ( fitTypeNew === FitType.BEST ) {
        // remove update listeners for parameters
        if ( fitTypePrev === FitType.ADJUSTABLE ) {
          self.saveValuesToStorage();
        }

        self.updateFit();
        self.trigger( 'update' );
      }
      else if ( fitTypeNew === FitType.ADJUSTABLE ) {
        // add update listeners for parameters
        self.restoreValuesFromStorage();
        self.trigger( 'update' );
      }
    } );
  }

  return inherit( PropertySet, Curve, {

    // add point to curve
    addPoint: function( point ) {
      point.positionProperty.lazyLink( this._updateFitBinded );
      point.deltaProperty.link( this._updateFitBinded );
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
        y = points[ i ].y;
        x = points[ i ].x;
        yApproximated = this.d + this.c * x + this.b * x * x + this.a * x * x * x;
        yDeviationSquared = ( y - yApproximated ) * ( y - yApproximated );
        sum = sum + yDeviationSquared / ( points[ i ].delta * points[ i ].delta );
        this.yDeviationSquaredSum += yDeviationSquared;
      }

      return sum;
    },

    // select points above graph area
    getPoints: function() {
      return this.points.getArray().filter( function( point ) {
        return (!isNaN( point.x ) && !isNaN( point.y ));
      } );
    },

    // remove point from curve
    removePoint: function( point ) {
      point.positionProperty.unlink( this._updateFitBinded );
      point.deltaProperty.unlink( this._updateFitBinded );
      this.updateFit();
    },

    reset: function() {
      PropertySet.prototype.reset.call( this );

      this.yDeviationSquaredSum = 0;
      setDefaultAdjustableValues( this._storage );
      this.points.reset();
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
        ySum = ySum + points[ i ].y;
      }

      ySum = ySum / pointsLength;

      for ( i = 0; i < pointsLength; ++i ) {
        yDeviation = points[ i ].y - ySum;
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