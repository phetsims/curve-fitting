// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model of a polynomial curve.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Emitter = require( 'AXON/Emitter' );
  var FitMaker = require( 'CURVE_FITTING/curve-fitting/model/FitMaker' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );


  /**
   * @param {Points} points - array of points
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Property.<string>} fitProperty - the method of fitting the curve to data points
   * @constructor
   */
  function Curve( points, orderProperty, fitProperty ) {
    var self = this;

    // @public
    this.aProperty = new NumberProperty( 0 ); // coefficient for x^3 term
    this.bProperty = new NumberProperty( 0 );// coefficient for x^2 term
    this.cProperty = new NumberProperty( 0 );// coefficient for x^1 term
    this.dProperty = new NumberProperty( 2.7 );// coefficient for x^0 term (constant term)

    // @public {Property.<number>}  X^2 deviation value, a number ranging from 0 to + $\infty$
    this.chiSquaredProperty = new NumberProperty( 0 );

    // @public {Property.<number>}  r^2 deviation value, a number ranging from 0 to 1
    this.rSquaredProperty = new NumberProperty( 0 );

    // @private
    this.orderProperty = orderProperty;
    this.fitProperty = fitProperty;

    // @private creates a fit for points
    this.fitMaker = new FitMaker();

    // @public (read-only)
    this.updateCurveEmitter = new Emitter();

    this.updateFitBinded = this.updateFit.bind( this ); // @private

    this.points = points;

    orderProperty.lazyLink( function( order, oldOrder ) {

      assert && assert( order >= 1 && order <= 3, 'invalid order: ' + order );

      // save and restore coefficient values
      if ( order === 3 ) {
        self.aProperty.value = self._storage.a;
      }
      else if ( order === 2 ) {
        if ( oldOrder === 3 ) {
          self._storage.a = self.aProperty.value;
          self.aProperty.value = 0;
        }
        else {
          self.bProperty.value = self._storage.b;
        }
      }
      else if ( order === 1 ) {
        if ( oldOrder === 3 ) {
          self._storage.a = self.aProperty.value;
          self.aProperty.value = 0;
        }
        if ( oldOrder >= 2 ) {
          self._storage.b = self.bProperty.value;
          self.bProperty.value = 0;
        }
      }

      self.updateFit();
    } );

    // Storage necessary to store and restore user's adjustable values on call.
    // Values are putting into storage when user switches to "Best fit".
    // If after that user switch back "Adjustable fit" (without turn on/off "Curve" between operations)
    // adjustable values will be restored from storage. If "Curve" is turn off then storage values is flush.
    this._storage = {}; // @private
    this.setDefaultAdjustableValues( this._storage );

    //TODO This many lazyLink calls looks suspicious, probably making assumption about initial state of sim
    this.aProperty.lazyLink( this.updateFitBinded );
    this.bProperty.lazyLink( this.updateFitBinded );
    this.cProperty.lazyLink( this.updateFitBinded );
    this.dProperty.lazyLink( this.updateFitBinded );

    fitProperty.lazyLink( function( fit, oldFit ) {
      if ( fit === 'best' ) {
        if ( oldFit === 'adjustable' ) {
          // save adjustable values in storage
          self.saveValuesToStorage();
        }

        self.updateFit();

      }
      else if ( fit === 'adjustable' ) {
        // restore adjustable values from storage
        self.restoreValuesFromStorage();
      }
    } );
  }

  curveFitting.register( 'Curve', Curve );

  return inherit( Object, Curve, {

    /**
     * Reset @public
     */
    reset: function() {
      this.aProperty.reset();
      this.bProperty.reset();
      this.cProperty.reset();
      this.dProperty.reset();
      this.rSquaredProperty.reset();
      this.chiSquaredProperty.reset();
      this.setDefaultAdjustableValues( this._storage );
    },

    /**
     * set default adjustable values
     * @param {Object} storage
     * @private
     */
    setDefaultAdjustableValues: function( storage ) {
      storage.a = this.aProperty.initialValue;
      storage.b = this.bProperty.initialValue;
      storage.c = this.cProperty.initialValue;
      storage.d = this.dProperty.initialValue;
    },

    /**
     * Save values to storage. Necessary when switching to adjustable mode.
     *
     * @private
     */
    saveValuesToStorage: function() {
      this._storage.a = this.aProperty.value;
      this._storage.b = this.bProperty.value;
      this._storage.c = this.cProperty.value;
      this._storage.d = this.dProperty.value;
    },

    /**
     * Restores values from storage. Necessary when switching back from adjustable mode.
     *
     * @private
     */
    restoreValuesFromStorage: function() {
      this.aProperty.set( this._storage.a );
      this.bProperty.set( this._storage.b );
      this.cProperty.set( this._storage.c );
      this.dProperty.set( this._storage.d );
      //TODO why doesn't this call updateCurveEmitter.emit?
    },

    /**
     * Updates fit for current points.
     *
     * @public
     */
    updateFit: function() {

      if ( this.fitProperty.value === 'best' ) {
        var fit = this.fitMaker.getFit( this.points.getPointsOnGraph(), this.orderProperty.value );

        this.dProperty.value = isFinite( fit[ 0 ] ) ? fit[ 0 ] : 0;
        this.cProperty.value = isFinite( fit[ 1 ] ) ? fit[ 1 ] : 0;
        this.bProperty.value = isFinite( fit[ 2 ] ) ? fit[ 2 ] : 0;
        this.aProperty.value = isFinite( fit[ 3 ] ) ? fit[ 3 ] : 0;
      }

      this.updateRAndChiSquared();
      this.updateCurveEmitter.emit();
    },

    /**
     * Gets the y value of the curve associated with the x coordinate
     *
     * @param {number} x
     * @returns {number}
     * @public
     */
    getYValueAt: function( x ) {
      var yValue = this.dProperty.value;
      if ( this.orderProperty.value >= 1 ) {
        yValue += this.cProperty.value * x;
      }
      if ( this.orderProperty.value >= 2 ) {
        yValue += this.bProperty.value * Math.pow( x, 2 );
      }
      if ( this.orderProperty.value >= 3 ) {
        yValue += this.aProperty.value * Math.pow( x, 3 );
      }

      return yValue;
    },

    /**
     * is the fit valid
     * @returns (boolean}
     * @public (read-only)
     */
    isValidFit: function() {
      var isValidFit = !isNaN(this.dProperty.value);
      if ( this.orderProperty.value >= 1 ) {
        isValidFit *=!isNaN(this.cProperty.value );
      }
      if ( this.orderProperty.value >= 2 ) {
        isValidFit *= !isNaN(this.bProperty.value);
      }
      if ( this.orderProperty.value >= 3 ) {
        isValidFit *= !isNaN(this.aProperty.value);
      }

      return isValidFit;
    },


    /**
     * Updates Chi Square and r^2 deviation.
     *
     * @private
     */
    updateRAndChiSquared: function() {

      var self = this;
      var points = this.points.getPointsOnGraph();
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
      var rSquared;

      if ( numberOfPoints < 2 ) {
        // rSquared does not have any meaning, set to zero
        rSquared = 0;
      }
      else {
        points.forEach( function( point ) {
          x = point.positionProperty.value.x; // x value of this point
          y = point.positionProperty.value.y; // y value of this point
          yAt = self.getYValueAt( x ); // y value of the curve
          weight = 1 / (point.deltaProperty.value * point.deltaProperty.value); // weight of this point

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

        // weighted value of r square
        rSquared = 1 - ((yyAverage - 2 * yAtyAverage + yAtyAtAverage) /
                        (yyAverage - yAverage * yAverage));
      }

      // rSquared can be negative if the curve fitting is done by the user.
      if ( rSquared < 0 || isNaN( rSquared ) ) {
        this.rSquaredProperty.set( 0 );
      }
      else {
        this.rSquaredProperty.set( rSquared );
      }

      // calculation of chiSquared
      var order = this.orderProperty.value;
      var degreesOfFreedom = numberOfPoints - order - 1;

      if ( numberOfPoints > order + 1 ) {
        var chiSquared = (yySum - 2 * yAtySum + yAtyAtSum) / degreesOfFreedom;
        this.chiSquaredProperty.set( chiSquared );
      }
      else {
        this.chiSquaredProperty.set( 0 );
      }
    }
  } )
    ;
} )
;