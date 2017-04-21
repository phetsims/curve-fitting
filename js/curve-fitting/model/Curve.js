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
  var EPSILON = 1.0E-10;
  var DETERMINANT_EPSILON = 1.0E-30;

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

      return this.coefficients.reduce( function( accumulator, value, index ) {
        return accumulator + value * Math.pow( x, index );
      }, 0 );
    },

    /**
     * gets the shape of the curve
     * @returns {Shape}
     * @public
     */
    getShape: function() {
      return new CurveShape( this.getYValueAt.bind( this ), this.coefficients, this.orderProperty.value );
    },

    /**
     * gets the shape of the debug curve
     * @returns {Shape}
     * @public
     */
    getDebugShape: function() {
      return new CurveShape( this.getYValueAt.bind( this ), this.coefficients, this.orderProperty.value, { debug: true } );
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
      var numberOfPoints = points.length; //  number of points in the array

      if ( numberOfPoints < 2 ) {
        // rSquared and chiSquared do not have any meaning, set them to zero and bail out
        this.chiSquaredProperty.set( 0 );
        this.rSquaredProperty.set( 0 );
      }
      else {
        // calculation of rSquared and chiSquared
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
        var rSquared;
        var chiSquared;

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

        var residualSumOfSquares = (yySum - 2 * yAtySum + yAtyAtSum);
        // average of weighted squares of residuals, a.k.a average of residual squares
        var averageOfResidualSquares = residualSumOfSquares / denominator;
        //  average of weighted squares
        var averageOfSquares = yyAverage - yAverage * yAverage;
        // sum of of the weighted squares of residuals


        // calculation of chiSquared
        var order = this.orderProperty.value;
        var degreesOfFreedom = numberOfPoints - order - 1;
        chiSquared = residualSumOfSquares / Math.max( degreesOfFreedom, 1 );
        this.chiSquaredProperty.set( chiSquared );

        // calculation of rSquared  = 1 - averageOfResidualSquares / averageOfSquares;
        // handling for exceptions
        if ( Math.abs( averageOfResidualSquares ) < EPSILON || Math.abs( averageOfSquares ) < EPSILON ) {
          // avoid explicit division of zero by zero by setting rSquared to 1
          rSquared = 1;
        }
        else if ( averageOfResidualSquares / averageOfSquares > 1 ) {
          // rSquared can be negative if the curve fitting done by the client i.e. 'adjustable fit' is very poor
          // set it to zero for those cases.
          rSquared = 0;
        }
        else {
          // weighted value of r square
          rSquared = 1 - averageOfResidualSquares / averageOfSquares;
        }
        assert && assert( rSquared >= 0 && rSquared <= 1, 'rSquared should range from 0 to 1 ');
        this.rSquaredProperty.set( rSquared );
      }
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

      // the rank of the matrix cannot be larger than the number of points with unique x value
      // the rank of the matrix, m, is the order +1, or the number of points with unique x value, whichever is less.
      var m = Math.min( solutionArrayLength, this.points.getNumberUniquePositionX() );

      var squareMatrix = new Matrix( m, m ); // matrix X
      var columnMatrix = new Matrix( m, 1 ); // matrix Y

      var i;
      var j;

      // fill out the elements of the column Matrix
      for ( i = 0; i < m; ++i ) {
        columnMatrix.set( i, 0, pointsOnGraph.reduce( function( accumulator, point ) {
            var deltaSquared = Math.pow( point.deltaProperty.value, 2 );
            var x = point.positionProperty.value.x;
            var y = point.positionProperty.value.y;
            return accumulator + Math.pow( x, i ) * y / deltaSquared;
          }, 0  // initial value of accumulator
        ) );
      }

      // fill out the elements of the square Matrix
      for ( i = 0; i < m; ++i ) {
        for ( j = 0; j < m; ++j ) {
          squareMatrix.set( i, j, pointsOnGraph.reduce( function( accumulator, point ) {
              var deltaSquared = Math.pow( point.deltaProperty.value, 2 );
              var x = point.positionProperty.value.x;
              return accumulator + Math.pow( x, i + j ) / deltaSquared;
            }, 0 // initial value of accumulator
          ) );
        }
      }

      // the coefficients are ordered in order of polynomial, eg. a_0, a_1, a_2, etc,
      // bestCoefficients must have a length of solutionArrayLength.
      // solutionArrayLength may be longer than the rank of the square matrix
      var bestFitCoefficients = [];

      // filled the bestFitCoefficients array with zeros, the default solution
      var n;
      for ( n = 0; n < solutionArrayLength; n++ ) {
        bestFitCoefficients.push( 0 );
      }

      // if the square matrix is not singular, it implies that a solution exists
      if ( Math.abs( squareMatrix.det() ) > DETERMINANT_EPSILON ) {
        // the solution matrix, A, is X^-1 * Y
        var solutionMatrix = squareMatrix.solve( columnMatrix );
        // unpack the column solution Matrix into a javascript array
        for ( n = 0; n < m; n++ ) {
          bestFitCoefficients[ n ] = solutionMatrix.get( n, 0 );
        }
      }

      bestFitCoefficients.forEach( function( value, index ) {
        assert && assert( isFinite( value ), 'fit parameter: ' + index + ' is not finite: ' + value );
      } );

      return bestFitCoefficients;
    }
  } );
} )
;