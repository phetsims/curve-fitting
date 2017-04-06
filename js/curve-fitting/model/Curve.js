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
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var FitMaker = require( 'CURVE_FITTING/curve-fitting/model/FitMaker' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var DEBUG = false;

  /**
   * @param {Points} points - array of points
   * @param {Property.<number>[]} sliderPropertyArray - an array of property starting from dProperty up to aProperty
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Property.<string>} fitProperty - the method of fitting the curve to data points
   * @constructor
   */
  function Curve( points, sliderPropertyArray, orderProperty, fitProperty ) {

    // @public {Property.<number>}  X^2 deviation value, a number ranging from 0 to + $\infty$
    this.chiSquaredProperty = new NumberProperty( 0 );

    // @public {Property.<number>}  r^2 deviation value, a number ranging from 0 to 1
    this.rSquaredProperty = new NumberProperty( 0 );

    // @public (read-only) {Array.<number>} array of coefficients of the polynomial curve stored in ascending polynomial order.
    // eg. y = a_0 +a_1 x + a_2 x^2 + a_3 x^3  yields [a_0, a_1, a_2, a_3]
    this.coefficientArray = [];

    // @private {Property.<number>[]} array of slider property stored in ascending polynomial order
    this.sliderPropertyArray = sliderPropertyArray;

    // @private
    this.orderProperty = orderProperty;
    this.fitProperty = fitProperty;

    // @private creates a fit for points
    this.fitMaker = new FitMaker();

    // @public
    this.updateCurveEmitter = new Emitter();

    // @private
    this.points = points;

  }

  curveFitting.register( 'Curve', Curve );

  return inherit( Object, Curve, {

    /**
     * Reset
     * @public
     */
    reset: function() {

      this.rSquaredProperty.reset();
      this.chiSquaredProperty.reset();
    },

    /**
     * get coefficient array
     * @public
     */
    getCoefficientArray: function() {
      return this.coefficientArray;
    },

    /**
     * Updates fit for current points.
     *
     * @public
     */
    updateFit: function() {
      var self = this;
      if ( this.fitProperty.value === 'best' ) {
        this.coefficientArray = this.fitMaker.getFit( this.points.getPointsOnGraph(), this.orderProperty.value );

        this.coefficientArray.forEach( function( value, index ) {
          if ( self.orderProperty.value >= index ) {
            assert && assert( isFinite( value ), 'fit parameter: ' + index + ' is not finite: ' + value );
          }
        } );
      }
      else {
        // must be  (this.fitProperty.value === 'adjustable')
        // clear up the coefficient array
        this.coefficientArray = [];

        // assign the slider values to the coefficients in the array
        this.sliderPropertyArray.forEach( function( sliderProperty, index ) {
          if ( self.orderProperty.value >= index ) {
            self.coefficientArray.push( sliderProperty.value );
          }
        } );
      }

      // update the property values of r squared and chi squared
      this.updateRAndChiSquared();

      // send a message to the view to update the curve and the residuals
      this.updateCurveEmitter.emit();
    },

    /**
     * Gets the y value of the curve associated with the x coordinate
     *
     * @param {number} x
     * @returns {number}
     * @public (read-only)
     */
    getYValueAt: function( x ) {
      var self = this;
      var yValue = 0;
      this.coefficientArray.forEach( function( value, index ) {
        if ( self.orderProperty.value >= index ) {
          yValue += value * Math.pow( x, index );
        }
      } );

      return yValue;
    },

    /**
     * is the fit valid
     * @returns {boolean}
     * @public (read-only)
     */
    isValidFit: function() {
      var self = this;
      var isValidFit = true;
      this.coefficientArray.forEach( function( value, index ) {
        if ( self.orderProperty.value >= index ) {
          isValidFit = isValidFit && isFinite( value );
        }
      } );

      return isValidFit;
    },

    /**
     * is curve present
     * curve fitting must have at least one point on graph (or be set to adjustable fit)
     * @returns {boolean}
     * @public (read-only)
     */
    isCurvePresent: function() {
      return this.isValidFit() &&
             ( this.points.getNumberPointsOnGraph() > 1 || this.fitProperty.value === 'adjustable' );
    },

    /**
     * gets the shape of the curve
     * @returns {Shape}
     * @public (read-only)
     */
    getShape: function() {

      var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

      // convenience variables
      var xMin = graphBounds.minX; // minimum value of the x range
      var xMax = graphBounds.maxX; // maximum value of the x range

      // create a new shape
      var curveShape = new Shape();

      var i = 0;
      var xStart;
      var xEnd;

      // curve is a line, quadratic or cubic depending on the order of the fit.
      switch( this.orderProperty.value ) {
        case 3: //cubic

          var cubicSteps = 10;
          var cubicInterval = (xMax - xMin) / cubicSteps;

          for ( i = 0; i < cubicSteps; i++ ) {
            xStart = xMin + i * cubicInterval;
            xEnd = xStart + cubicInterval;
            curveShape = this.addCubic( curveShape, xStart, xEnd );
          }
          break;
        case 2 : // quadratic
          var quadraticSteps = 10;
          var quadraticInterval = (xMax - xMin) / quadraticSteps;

          for ( i = 0; i < quadraticSteps; i++ ) {
            xStart = xMin + i * quadraticInterval;
            xEnd = xStart + quadraticInterval;
            curveShape = this.addQuadratic( curveShape, xStart, xEnd );
          }
          break;
        default: // linear

          curveShape = this.addLinear( curveShape, xMin, xMax );
          break;
      } // end of switch statement

      if ( DEBUG ) {
        var steps = 1000;
        var interval = (xMax - xMin) / steps;
        i = 0;
        var xValue;
        curveShape.moveTo( xMin, this.getYValueAt( xMin ) );
        for ( i; i < steps; i++ ) {
          xValue = xMin + i * interval;
          curveShape.lineTo( xValue, this.getYValueAt( xValue ) );
        }
      }
      return curveShape;
    },

    /**
     * Add a cubic segment shape between x position start and x position end
     * @param {Shape} shape
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     */
    addCubic: function( shape, start, end ) {

      var cp1x = (2 * start + end) / 3; // one third of the way between start and end
      var cp2x = (start + 2 * end) / 3; // two third of the way between start and end

      var yAtStart = this.getYValueAt( start );
      var yAtEnd = this.getYValueAt( end );
      var yAtCp1x = this.getYValueAt( cp1x );
      var yAtCp2x = this.getYValueAt( cp2x );

      // the control points cp1y and cp2y are not given by the values at yAtCp1x and yAtCp2x, but are related tp them through the equations
      var cp1y = (-5 * yAtStart + 18 * yAtCp1x - 9 * yAtCp2x + 2 * yAtEnd) / 6;
      var cp2y = (+2 * yAtStart - 9 * yAtCp1x + 18 * yAtCp2x - 5 * yAtEnd) / 6;

      shape.moveTo( start, yAtStart ).cubicCurveTo( cp1x, cp1y, cp2x, cp2y, end, yAtEnd );
      return shape;
    },

    /**
     * Add a quadratic segment shape between x position start and x position end
     * @param {Shape} shape
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     */
    addQuadratic: function( shape, start, end ) {

      var cpx = (start + end) / 2; // point halfway between start and end

      var yAtStart = this.getYValueAt( start );
      var yAtEnd = this.getYValueAt( end );
      var yAtCpx = this.getYValueAt( cpx );

      // the control points cpy is not the value of yAtCpx but is related to it by the equation
      var cpy = (-yAtStart + 4 * yAtCpx - yAtEnd) / 2;

      shape.moveTo( start, yAtStart ).quadraticCurveTo( cpx, cpy, end, yAtEnd );
      return shape;
    },

    /**
     * Add a linear segment shape between x position start and x position end
     * @param {Shape} shape
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     */
    addLinear: function( shape, start, end ) {

      var yStart = this.getYValueAt( start );
      var yEnd = this.getYValueAt( end );
      shape.moveTo( start, yStart ).lineTo( end, yEnd );
      return shape;
    },
    /**
     * Updates chi^2 and r^2 deviation.
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
  } );
} );