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
  var CurveShape = require( 'CURVE_FITTING/curve-fitting/model/CurveShape' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix = require( 'DOT/Matrix' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var EPSILON = 1E-30;

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
    // the length of the array is equal to the order of the polynomial + 1
    this.coefficients = [];

    // @public
    this.updateCurveEmitter = new Emitter();

    // @private {Property.<number>[]} array of slider property stored in ascending polynomial order
    this.sliderPropertyArray = sliderPropertyArray;

    // @private
    this.orderProperty = orderProperty;
    this.fitProperty = fitProperty;
    this.points = points;
  }

  curveFitting.register( 'Curve', Curve );

  return inherit( Object, Curve, {

    /**
     * resets
     * @public
     */
    reset: function() {
      this.rSquaredProperty.reset();
      this.chiSquaredProperty.reset();
    },

    /**
     * gets coefficient array of the polynomial, sorted in ascending order
     * e.g. y = 5 + 3 x + 4 x^2 yields [5,3,4]
     * @returns {number[]}
     * @public (read-only)
     */
    getCoefficients: function() {
      return this.coefficients;
    },

    /**
     * does a curve exist
     * curve fitting must have at least two points on graph (or be set to adjustable fit)
     * @returns {boolean}
     * @public (read-only)
     */
    isCurvePresent: function() {
      return ( this.points.getNumberPointsOnGraph() >= 2 || this.fitProperty.value === 'adjustable' );
    },

    /**
     * gets the y value of the curve associated with the x coordinate
     * @param {number} x
     * @returns {number}
     * @public (read-only)
     */
    getYValueAt: function( x ) {
      assert && assert( this.coefficients.length === this.orderProperty.value + 1, 'the coefficient array should be ' + this.orderProperty.value + 1 + ' long but is ' + this.coefficients.length );

      var yValue = 0;
      this.coefficients.forEach( function( value, index ) {
        yValue += value * Math.pow( x, index );
      } );

      return yValue;
    },

    /**
     * gets the shape of the curve
     * @returns {Shape}
     * @public
     */
    getShape: function() {
      return new CurveShape( this.getYValueAt.bind( this ), this.orderProperty.value );
    },

    /**
     * updates fit
     * updates coefficients of the polynomial and recalculate the chi squared and r squared values
     * sends a message to the view to update itself
     * @public
     */
    updateFit: function() {

      if ( this.fitProperty.value === 'best' ) {
        this.coefficients = this.getBestFitCoefficients();
      }
      else { // must be (this.fitProperty.value === 'adjustable')
        this.coefficients = this.getAdjustableFitCoefficients();
      }

      assert && assert( this.coefficients.length === this.orderProperty.value + 1, 'the coefficient array should be ' + this.orderProperty.value + 1 + ' long but is ' + this.coefficients.length );

      this.coefficients.forEach( function( value, index ) {
        assert && assert( isFinite( value ), 'fit parameter: ' + index + ' is not finite: ' + value );
      } );

      // update the property values of r squared and chi squared
      this.updateRAndChiSquared();

      // send a message to the view to update the curve and the residuals
      this.updateCurveEmitter.emit();
    },
    /**
     * gets adjustable fit coefficients sorted in ascending order
     * the number of coefficients is equal to 1 + order
     * @returns {number[]} solution an array containing the coefficients of the polynomial for adjustable values
     * @private
     */
    getAdjustableFitCoefficients: function() {
      var order = this.orderProperty.value;
      var adjustableFitCoefficients = [];
      // assign the slider values to the coefficients in the array
      this.sliderPropertyArray.forEach( function( sliderProperty, index ) {
        // ensure that only the relevant coefficients are passed on to the array
        if ( index <= order ) {
          adjustableFitCoefficients.push( sliderProperty.value );
        }
      } );
      return adjustableFitCoefficients;
    },
    /**
     * updates chi^2 and r^2 deviations
     * the chi squared and r squared calculations depend solely on the point's positions, their deltas and the
     * curve fit.
     *
     * chi squared ranges from 0 to infinity
     * the chi squared value is undefined when the number of points on the graph is less than the order of the polynomial +1, in which case
     * a value of zero is returned
     *
     * r squared ranges from 0 to 1 for 'best fit'
     * it is possible for 'adjustable fit' to get such a bad fit that the standard r squared calculation would yield a negative value.
     * For those cases, the r squared value to zero is set to zero.
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

      var chiSquared = (yySum - 2 * yAtySum + yAtyAtSum) / Math.max( degreesOfFreedom, 1 );
      this.chiSquaredProperty.set( chiSquared );

    },
    /**
     * returns a solution an array containing the coefficients of the polynomial for best fit

     * The solution is found by solving the matrix equation, Y = X A
     * where X is a square matrix, and Y is a column matrix.
     *
     * The number of rows of the solution matrix, A,  is given by the number of points, or
     * the order +1, whichever is smaller.
     * If the square matrix is singular, an array filled with zero is returned
     * otherwise, the solution matrix is unpacked into an array
     * The length of the solution array is equal to the order + 1
     *
     * see http://mathworld.wolfram.com/LeastSquaresFittingPolynomial.html
     *
     * @returns {number[]} solution an array containing the best fit coefficients of the polynomial
     * @private
     */
    getBestFitCoefficients: function() {

      var pointsOnGraph = this.points.getPointsOnGraph();

      var solutionArrayLength = this.orderProperty.value + 1;

      // the rank of the matrix cannot be larger than the number of points
      // TODO it should not be pointsOnGraph.length but the number of pointsOnGraph with unique x values.
      var m = Math.min( solutionArrayLength, pointsOnGraph.length );

      var squareMatrix = new Matrix( m, m ); // matrix X
      var columnMatrix = new Matrix( m, 1 ); // matrix Y

      // fill out the elements of the matrices Y and X
      pointsOnGraph.forEach( function( point ) {
        var deltaSquared = point.deltaProperty.value * point.deltaProperty.value;
        var x = point.positionProperty.value.x;
        var y = point.positionProperty.value.y;

        for ( var j = 0; j < m; ++j ) {
          for ( var k = 0; k < m; ++k ) {
            squareMatrix.set( j, k, squareMatrix.get( j, k ) + Math.pow( x, j + k ) / deltaSquared );
          }
          columnMatrix.set( j, 0, columnMatrix.get( j, 0 ) + Math.pow( x, j ) * y / deltaSquared );
        }
      } );

      // the coefficients are ordered in order of polynomial, eg. a_0, a_1, a_2, etc,
      var bestFitCoefficients = [];

      // filled the bestFitCoefficients array with zeros, the default solution
      var n;
      for ( n = 0; n < solutionArrayLength; n++ ) {
        bestFitCoefficients.push( 0 );
      }

      // the square matrix is not singular
      if ( Math.abs( squareMatrix.det() ) > EPSILON ) {
        // the solution matrix, A, is X^-1 * Y
        var solutionMatrix = squareMatrix.solve( columnMatrix );
        // unpack the column solution matrix into an array
        for ( n = 0; n < m; n++ ) {
          bestFitCoefficients[ n ] = solutionMatrix.get( n, 0 );
        }
      }

      return bestFitCoefficients;
    }
  } );
} );