// Copyright 2015-2016, University of Colorado Boulder

/**
 * Fit maker for 'Curve Fitting' simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix = require( 'DOT/Matrix' );

  // constants
  var EPSILON = 1E-12;

  /**
   * @constructor
   */
  function FitMaker() {

    // @private
    this.solutionArray = [];
  }

  curveFitting.register( 'FitMaker', FitMaker );

  return inherit( Object, FitMaker, {

    /**
     * Returns a numerical array of the coefficients of the polynomial
     * @param {Array.<Point>} points
     * @param {number} order
     * @returns {Array}
     * @public
     */
    getFit: function( points, order ) {

      // column matrix with the coefficients
      var solutionMatrix = this.getSolutionMatrix( points, order );

      // size of the column matrix
      var numberOfRows = solutionMatrix.getRowDimension();

      var solutionArrayLength = CurveFittingConstants.MAX_ORDER_OF_FIT + 1;
      // the solutionArray has solutionArrayLength elements, regardless of the dimensions of the solution matrix
      // the missing elements are padded with zeros

      for ( var k = 0; k < solutionArrayLength; ++k ) {
        this.solutionArray[ k ] = (k < numberOfRows) ? solutionMatrix.get( k, 0 ) : 0;
      }
      return this.solutionArray;
    },

    /**
     * Returns a column solution matrix, A, containing the coefficients of the polynomial
     * The solution matrix is found by solving the equation, Y = X A
     * where X is a square matrix, and Y is a column matrix.
     *
     * the number of rows of the solution matrix is given by the number of points, or
     * the order +1, whichever is smaller.
     *
     * see http://mathworld.wolfram.com/LeastSquaresFittingPolynomial.html
     *
     * @param {Array.<Point>} points
     * @param {number} order
     * @returns {Matrix} the column matrix A
     * @private
     */
    getSolutionMatrix: function( points, order ) {

      // the rank of the matrix cannot be larger than the number of points
      var m = Math.min( order + 1, points.length );

      var squareMatrix = new Matrix( m, m ); // matrix X
      var columnMatrix = new Matrix( m, 1 ); // matrix Y

      // fill out the elements of the matrices Y and X
      points.forEach( function( point ) {
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

      //  column solution Matrix,
      // the coefficients are ordered in order of polynomial, eg. a_0, a_1, a_2, etc,
      var solutionMatrix;

      if ( Math.abs( squareMatrix.det() ) > EPSILON ) {
        // the solution matrix, A, is X^-1 * Y
        solutionMatrix = squareMatrix.solve( columnMatrix );
      }
      else {
        // the matrix is singular, the solution Matrix is filled with zeros
        solutionMatrix = new Matrix( m, 1, 0 );
      }
      return solutionMatrix;
    }
  } );
} );