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
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Property.<string>} fitProperty - the method of fitting the curve to data points
   * @constructor
   */
  function Curve( orderProperty, fitProperty ) {
    var self = this;

    PropertySet.call( this, {

      // @public
      a: 0, // coefficient for x^3 term
      b: 0, // coefficient for x^2 term
      c: 0, // coefficient for x^1 term
      d: 0, // polynomial constant term
      chiSquare: 0, // X^2 deviation value TODO rename to chiSquared?
      rSquare: 0, // r^2 deviation value TODO rename to rSquared?
      isVisible: false // curve flag visibility TODO move this view-specific Property to CurveFittingScreenView
    } );

    // @private
    this.orderProperty = orderProperty;
    this.fitProperty = fitProperty;

    // @public Points for plotting curve. Only point above graph will be taken for calculations. Order doesn't matter.
    this.points = new ObservableArray();

    // @private creates a fit for points
    this.fitMaker = new FitMaker();

    // @public (read-only)
    this.updateCurveEmitter = new Emitter();

    this.updateFitBinded = this.updateFit.bind( this ); // @private

    // Add internal listeners for adding and removing points
    this.points.addListeners( this.addPoint.bind( this ), this.removePoint.bind( this ) );

    orderProperty.lazyLink( function( order, oldOrder ) {

      assert && assert( order >= 1 && order <= 3, 'invalid order: ' + order );

      // save and restore coefficient values
      if ( order === 3 ) {
        self.a = self._storage.a;
      }
      else if ( order === 2 ) {
        if ( oldOrder === 3 ) {
          self._storage.a = self.a;
          self.a = 0;
        }
        else {
          self.b = self._storage.b;
        }
      }
      else if ( order === 1 ) {
        if ( oldOrder === 3 ) {
          self._storage.a = self.a;
          self.a = 0;
        }
        if ( oldOrder >= 2 ) {
          self._storage.b = self.b;
          self.b = 0;
        }
      }

      self.updateFit();
    } );

    // Storage necessary to store and restore user's adjustable values on call.
    // Values are putting into storage when user switches to "Best fit".
    // If after that user switch back "Adjustable fit" (without turn on/off "Curve" between operations)
    // adjustable values will be restored from storage. If "Curve" is turn off then storage values is flush.
    this._storage = {}; // @private
    setDefaultAdjustableValues( this._storage );

    //TODO unlink?
    this.isVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        self.updateFit();
      }
      else if ( fitProperty.value === 'best' ) {
        // flush storage values
        setDefaultAdjustableValues( self._storage );
      }
      else if ( fitProperty.value === 'adjustable' ) {
        // set default values
        setDefaultAdjustableValues( self );
      }
    } );

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
        self.updateCurveEmitter.emit();
      }
      else if ( fit === 'adjustable' ) {
        // restore adjustable values from storage
        self.restoreValuesFromStorage();
        self.updateCurveEmitter.emit();
      }
    } );
  }

  curveFitting.register( 'Curve', Curve );

  //Why don't these values come from aProperty.initialValue, bProperty.initialValue, etc?
  // set default adjustable values
  function setDefaultAdjustableValues( obj ) {
    obj.a = 0;
    obj.b = 0;
    obj.c = 0;
    obj.d = 2.7; //TODO why this magic value? Why isn't this the value used to initialize dProperty?
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

      // These are unlinked in removePoint
      point.positionProperty.link( this.updateFitBinded );
      point.isInsideGraphProperty.lazyLink( this.updateFitBinded );
      point.deltaProperty.link( this.updateFitBinded );

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

      point.positionProperty.unlink( this.updateFitBinded );
      point.isInsideGraphProperty.unlink( this.updateFitBinded );
      point.deltaProperty.unlink( this.updateFitBinded );

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
      var rSquare;

      if ( numberOfPoints < 2 ) {
        // rSquare does not have any meaning, set to zero
        rSquare = 0;
      }
      else {
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

        // weighted value of r square
        rSquare = 1 - ((yyAverage - 2 * yAtyAverage + yAtyAtAverage) /
                       (yyAverage - yAverage * yAverage));
      }

      // rSquare can be negative if the curve fitting is done by the user.
      if ( rSquare < 0 || isNaN( rSquare ) ) {
        this.rSquare = 0;
      }
      else {
        this.rSquare = rSquare;
      }

      // calculation of chiSquare
      var order = this.orderProperty.value;
      var degreesOfFreedom = numberOfPoints - order - 1;

      if ( numberOfPoints > order + 1 ) {
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

      //TODO if this is updating only when visible, then I would expect to see setVisible override, probably some workaround instead
      // update only when curve visible
      if ( this.isVisible ) {
        if ( this.fitProperty.value === 'best' ) {
          var fit = this.fitMaker.getFit( this.getPoints(), this.orderProperty.value );

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