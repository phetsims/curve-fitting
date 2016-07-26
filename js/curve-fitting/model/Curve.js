// Copyright 2015-2016, University of Colorado Boulder

/**
 * Curve model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Emitter = require( 'AXON/Emitter' );
  var FitMaker = require( 'CURVE_FITTING/curve-fitting/model/FitMaker' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Property.<number>} orderOfFitProperty - Property to control curve type.
   * @param {Property.<string>} fitTypeProperty - Property to control fit type.
   * @constructor
   */
  function Curve( orderOfFitProperty, fitTypeProperty ) {
    var self = this;

    PropertySet.call( this, {
      a: 0, // parameter with x^3
      b: 0, // parameter with x^2
      c: 0, // parameter with x^1
      d: 0, // parameter with constant
      chiSquare: 0, // x^2 deviation value
      rSquare: 0, // r^2 deviation value

      //TODO move this view-specific Property to CurveFittingScreenView
      isVisible: false // curve flag visibility
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

    this.updateCurveEmitter = new Emitter();

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
        self.updateCurveEmitter.emit();
      }
      else if ( fitTypeNew === FitType.ADJUSTABLE ) {
        // restore adjustable values from storage
        self.restoreValuesFromStorage();
        self.updateCurveEmitter.emit();
      }
    } );
  }

  curveFitting.register( 'Curve', Curve );

  // set default adjustable values
  function setDefaultAdjustableValues( obj ) {
    obj.a = 0;
    obj.b = 0;
    obj.c = 0;
    obj.d = 2.7;
  }

  return inherit( PropertySet, Curve, {

    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
      setDefaultAdjustableValues( this._storage );
      this.points.clear();
    },

    /**
     * Gets the y coordinate of a point on the curve, given the x coordinate.
     *
     * @param {number} x
     * @returns {number}
     * @public
     */
    getYValueAt: function( x ) {
      return this.a * Math.pow( x, 3 ) + this.b * Math.pow( x, 2 ) + this.c * ( x  ) + this.d;
    },

    //TODO give this a better name
    /**
     * Gets all points that are within the graph bounds.
     *
     * @returns {Array.<Point>}
     * @public
     */
    getPoints: function() {
      return this.points.getArray().filter( function( point ) {
        return point.isInsideGraph;
      } );
    },

    /**
     * Adds a point to the curve.
     *
     * @param {Point} point
     * @private
     */
    addPoint: function( point ) {
      var self = this;

      point.positionProperty.link( this._updateFitBinded );
      point.isInsideGraphProperty.lazyLink( this._updateFitBinded );
      point.deltaProperty.link( this._updateFitBinded );

      // remove points when they have returned to the bucket 
      point.returnToOriginEmitter.addListener( function removePointListener() {
        self.points.remove( point );
        point.returnToOriginEmitter.removeListener( removePointListener );
      } );
    },

    /**
     * Removes a point from the curve.
     *
     * @param {Point} point
     * @private
     */
    removePoint: function( point ) {
      point.positionProperty.unlink( this._updateFitBinded );
      point.isInsideGraphProperty.unlink( this._updateFitBinded );
      point.deltaProperty.unlink( this._updateFitBinded );
      this.updateFit();
    },

    /**
     * Updates Chi Square and r^2 deviation.
     *
     * @private
     */
    updateRAndChiSquared: function() {
      var self = this;
      var points = this.getPoints();
      var weightSum = 0;
      var ySum = 0;
      var yySum = 0;
      var yAtSum = 0;
      var yAtySum = 0;
      var yAtyAtSum = 0;
      var x;
      var y;
      var yAt;
      var weight;
      var numberOfPoints = points.length; //  number of points in the array

      points.forEach( function( point ) {
        x = point.position.x; // x value of this point
        y = point.position.y; // y value of this point
        yAt = self.getYValueAt( x ); // y value of the curve
        weight = 1 / (point.delta * point.delta); // weight of this point

        weightSum = weightSum + weight; // sum of weights
        ySum = ySum + weight * y;   // weighted sum of y values
        yAtSum = yAtSum + weight * yAt; // weighted sum of the approximated y values (from curve)
        yySum = yySum + weight * y * y; // weighted sum of the square of the y values
        yAtySum = yAtySum + weight * yAt * y; // weighted sum of the product of of the y values times the approximated y value
        yAtyAtSum = yAtyAtSum + weight * yAt * yAt; // weighted sum of the squared of the approximated y value
      } );

      var weightAverage = weightSum / numberOfPoints; // average of the weights
      var denominator = (weightAverage * numberOfPoints); // convenience variable
      var yAverage = ySum / denominator; // weighted average of the y values
      var yyAverage = yySum / denominator; // weighted average of the <y_i y_i> correlation
      var yAtyAtAverage = yAtyAtSum / denominator; // weighted average of the <y_i yat_i> correlation
      var yAtyAverage = yAtySum / denominator; // weighted average of the <yat_i yat_i> correlation

      // weighted value of r square - note that rSquare is always smaller than 1 but can be negative
      var rSquare = 1 - ((yyAverage - 2 * yAtyAverage + yAtyAtAverage) /
                         (yyAverage - yAverage * yAverage));

      // rSquare can be negative if the curve fitting is done by the user.
      if ( rSquare < 0 || isNaN( rSquare ) ) {
        this.rSquare = 0;
      }
      else {
        this.rSquare = rSquare;
      }

      // calculation of chiSquare
      var orderOfFit = this._orderOfFitProperty.value;
      var degreesOfFreedom = numberOfPoints - orderOfFit - 1;

      if ( numberOfPoints > orderOfFit + 1 ) {
        this.chiSquare = (yySum - 2 * yAtySum + yAtyAtSum) / degreesOfFreedom;
      }
      else {
        this.chiSquare = 0;
      }

    },


    /**
     * Save values to storage. Necessary when switching to adjustable mode.
     *
     * @private
     */
    saveValuesToStorage: function() {
      this._storage.a = this.a;
      this._storage.b = this.b;
      this._storage.c = this.c;
      this._storage.d = this.d;
    },

    /**
     * Restores values from storage. Necessary when switching back from adjustable mode.
     *
     * @private
     */
    restoreValuesFromStorage: function() {
      this.a = this._storage.a;
      this.b = this._storage.b;
      this.c = this._storage.c;
      this.d = this._storage.d;
    },

    /**
     * Updates fit for current points.
     *
     * @private
     */
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

        this.updateRAndChiSquared();
        this.updateCurveEmitter.emit();
      }
    }
  } );
} );