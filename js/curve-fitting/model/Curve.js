// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model of a polynomial curve.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix from '../../../../dot/js/Matrix.js';
import curveFitting from '../../curveFitting.js';
import CurveShape from './CurveShape.js';
import FitType from './FitType.js';

// constants
const EPSILON = 1.0E-10;
const DETERMINANT_EPSILON = 1.0E-30;

class Curve {

  /**
   * @param {Points} points - array of points
   * @param {Property.<number>[]} sliderPropertyArray - an array of properties starting from dProperty up to aProperty
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Property.<FitType>} fitProperty - the method of fitting the curve to data points
   */
  constructor( points, sliderPropertyArray, orderProperty, fitProperty ) {

    // @public {Property.<number>} X^2 deviation value, a number ranging from 0 to + $\infty$
    this.chiSquaredProperty = new NumberProperty( 0, {
      isValidValue: value => value >= 0
    } );

    // @public {Property.<number>} r^2 deviation value, a number ranging from 0 to 1
    this.rSquaredProperty = new Property( 0, {
      valueType: 'number',
      isValidValue: value => isNaN( value ) || value >= 0 && value <= 1
    } );

    // @public (read-only) {Array.<number>} array of coefficients of the polynomial curve stored in ascending polynomial order.
    // eg. y = a_0 +a_1 x + a_2 x^2 + a_3 x^3 yields [a_0, a_1, a_2, a_3]
    // the length of the array is equal to the order of the polynomial + 1
    this.coefficients = [];

    // @public
    this.updateCurveEmitter = new Emitter();

    // @private {Property.<number>[]} array of slider Property stored in ascending polynomial order
    this.sliderPropertyArray = sliderPropertyArray;

    // @private
    this.orderProperty = orderProperty;
    this.fitProperty = fitProperty;
    this.points = points;
  }

  /**
   * Resets the X^2 and r^2 values.
   * @public
   */
  reset() {
    this.rSquaredProperty.reset();
    this.chiSquaredProperty.reset();
  }

  /**
   * does a curve exist
   * curve fitting must have at least two points on graph (or be set to adjustable fit)
   * @returns {boolean}
   * @public (read-only)
   */
  isCurvePresent() {
    return this.points.getRelevantPoints().length >= 2 || this.fitProperty.value === FitType.ADJUSTABLE;
  }

  /**
   * gets the y value of the curve associated with the x coordinate
   * @param {number} x
   * @returns {number}
   * @public (read-only)
   */
  getYValueAt( x ) {
    assert && assert( this.coefficients.length === this.orderProperty.value + 1,
      `the coefficient array should be ${this.orderProperty.value} long but is ${this.coefficients.length}` );

    return this.coefficients.reduce( ( accumulator, value, index ) => accumulator + value * Math.pow( x, index ), 0 );
  }

  /**
   * gets the shape of the curve
   * @returns {Shape}
   * @public
   */
  getShape() {
    return new CurveShape( x => this.getYValueAt( x ) );
  }

  get shape() { return this.getShape(); }

  /**
   * updates fit
   * updates coefficients of the polynomial and recalculate the chi squared and r squared values
   * sends a message to the view to update itself
   * @public
   */
  updateFit() {

    if ( this.fitProperty.value === FitType.BEST ) {
      this.coefficients = this.getBestFitCoefficients();
    }
    else { // this.fitProperty.value must be FitType.ADJUSTABLE
      this.coefficients = this.getAdjustableFitCoefficients();
    }

    assert && assert( this.coefficients.length === this.orderProperty.value + 1,
      `the coefficient array should be ${this.orderProperty.value + 1} long but is ${this.coefficients.length}` );

    // update the Property values of r squared and chi squared
    this.updateRAndChiSquared();

    // send a message to the view to update the curve and the residuals
    this.updateCurveEmitter.emit();
  }

  /**
   * gets adjustable fit coefficients sorted in ascending order
   * the number of coefficients is equal to 1 + order
   * @returns {number[]} solution an array containing the coefficients of the polynomial for adjustable values
   * @private
   */
  getAdjustableFitCoefficients() {
    const order = this.orderProperty.value;
    const adjustableFitCoefficients = [];

    // assign the slider values to the coefficients in the array
    this.sliderPropertyArray.forEach( ( sliderProperty, index ) => {

      // ensure that only the relevant coefficients are passed on to the array
      if ( index <= order ) {
        adjustableFitCoefficients.push( sliderProperty.value );
      }
    } );
    return adjustableFitCoefficients;
  }

  /**
   * updates chi^2 and r^2 deviations
   * the chi squared and r squared calculations depend solely on the point's positions, their deltas and the
   * curve fit.
   *
   * chi squared ranges from 0 to infinity
   *
   * r squared ranges from 0 to 1 for 'best fit'
   * it is possible for the adjustable fit to get such a bad fit that the standard r squared calculation would
   * yield a negative value. For those cases, the r squared value to zero is set to zero.
   *
   * @private
   */
  updateRAndChiSquared() {

    const points = this.points.getRelevantPoints();
    const numberOfPoints = points.length; // number of points in the array

    if ( numberOfPoints < 2 ) {

      // rSquared and chiSquared do not have any meaning, set them to zero and bail out
      this.chiSquaredProperty.value = 0;
      this.rSquaredProperty.value = 0;
    }
    else {

      // calculation of rSquared and chiSquared
      let weightSum = 0; // sum of weights
      let ySum = 0; // weighted sum of y values
      let yySum = 0; // weighted sum of the square of the y values
      let yAtSum = 0; // weighted sum of the approximated y values (from curve)
      let yAtySum = 0; // weighted sum of the product of of the y values times the approximated y value
      let yAtyAtSum = 0; // weighted sum of the squared of the approximated y value

      points.forEach( point => {
        const x = point.positionProperty.value.x; // x value of this point
        const y = point.positionProperty.value.y; // y value of this point
        const yAt = this.getYValueAt( x ); // y value of the curve
        const weight = 1 / ( point.deltaProperty.value * point.deltaProperty.value ); // weight of this point

        weightSum = weightSum + weight;
        ySum = ySum + weight * y;
        yAtSum = yAtSum + weight * yAt;
        yySum = yySum + weight * y * y;
        yAtySum = yAtySum + weight * yAt * y;
        yAtyAtSum = yAtyAtSum + weight * yAt * yAt;
      } );

      const weightAverage = weightSum / numberOfPoints; // average of the weights
      const denominator = weightAverage * numberOfPoints; // convenience variable
      const yAverage = ySum / denominator; // weighted average of the y values
      const yyAverage = yySum / denominator; // weighted average of the <y_i y_i> correlation

      // sum of of the weighted squares of residuals
      const residualSumOfSquares = yySum - 2 * yAtySum + yAtyAtSum;

      // average of weighted squares of residuals, a.k.a average of residual squares
      const averageOfResidualSquares = residualSumOfSquares / denominator;

      // average of weighted squares
      const averageOfSquares = yyAverage - yAverage * yAverage;

      // calculation of chiSquared
      const degreesOfFreedom = numberOfPoints - this.orderProperty.value - 1;
      this.chiSquaredProperty.value = Math.abs( residualSumOfSquares / Math.max( degreesOfFreedom, 1 ) );

      // calculation of rSquared = 1 - averageOfResidualSquares / averageOfSquares;
      // avoiding a divide by 0 situation and setting rSquared to NaN when averageOfSquares is basically 0; see #86
      let rSquared;
      if ( Math.abs( averageOfSquares ) < EPSILON ) {
        rSquared = NaN;
      }
      else if ( Math.abs( averageOfResidualSquares ) < EPSILON ) {
        rSquared = 1;
      }
      else if ( averageOfResidualSquares / averageOfSquares > 1 ) {

        // rSquared can be negative if the curve fitting done by the client i.e. adjustable fit is very poor
        // set it to zero for those cases.
        rSquared = 0;
      }
      else {

        // weighted value of r square
        rSquared = 1 - averageOfResidualSquares / averageOfSquares;
      }
      this.rSquaredProperty.value = rSquared;
    }
  }

  /**
   * returns a solution an array containing the coefficients of the polynomial for best fit
   *
   * The solution is found by solving the matrix equation, Y = X A
   * where X is a square matrix, and Y is a column matrix.
   *
   * The number of rows of the solution matrix, A, is given by the number of points, or
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
  getBestFitCoefficients() {

    const relevantPoints = this.points.getRelevantPoints();

    const solutionArrayLength = this.orderProperty.value + 1;

    // the rank of the matrix cannot be larger than the number of points with unique x value
    // the rank of the matrix is the order + 1, or the number of points with unique x value, whichever is less.
    const matrixRank = Math.min( solutionArrayLength, this.points.getNumberUniquePositionX() );

    const squareMatrix = new Matrix( matrixRank, matrixRank ); // matrix X
    const columnMatrix = new Matrix( matrixRank, 1 ); // matrix Y

    // fill out the elements of the column Matrix
    for ( let i = 0; i < matrixRank; ++i ) {
      columnMatrix.set(
        i,
        0,
        relevantPoints.reduce(
          ( accumulator, point ) => {
            const deltaSquared = Math.pow( point.deltaProperty.value, 2 );
            const x = point.positionProperty.value.x;
            const y = point.positionProperty.value.y;
            return accumulator + Math.pow( x, i ) * y / deltaSquared;
          },
          0 // initial value of accumulator
        )
      );
    }

    // fill out the elements of the square Matrix
    for ( let i = 0; i < matrixRank; ++i ) {
      for ( let j = 0; j < matrixRank; ++j ) {
        squareMatrix.set(
          i,
          j,
          relevantPoints.reduce(
            ( accumulator, point ) => {
              const deltaSquared = Math.pow( point.deltaProperty.value, 2 );
              const x = point.positionProperty.value.x;
              return accumulator + Math.pow( x, i + j ) / deltaSquared;
            },
            0 // initial value of accumulator
          )
        );
      }
    }

    // the coefficients are ordered in order of polynomial, eg. a_0, a_1, a_2, etc,
    // bestCoefficients must have a length of solutionArrayLength.
    // solutionArrayLength may be longer than the rank of the square matrix
    const bestFitCoefficients = [];

    // filled the bestFitCoefficients array with zeros, the default solution
    for ( let i = 0; i < solutionArrayLength; i++ ) {
      bestFitCoefficients.push( 0 );
    }

    // if the square matrix is not singular, it implies that a solution exists
    if ( Math.abs( squareMatrix.det() ) > DETERMINANT_EPSILON ) {

      // the solution matrix, A, is X^-1 * Y
      const solutionMatrix = squareMatrix.solve( columnMatrix );

      // unpack the column solution Matrix into a javascript array
      for ( let i = 0; i < matrixRank; i++ ) {
        bestFitCoefficients[ i ] = solutionMatrix.get( i, 0 );
      }
    }

    bestFitCoefficients.forEach( ( value, index ) => {
      assert && assert( typeof value === 'number' && isFinite( value ),
        `fit parameter: ${index} is not finite: ${value}` );
    } );

    return bestFitCoefficients;
  }

}

curveFitting.register( 'Curve', Curve );
export default Curve;