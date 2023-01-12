// Copyright 2015-2023, University of Colorado Boulder

/**
 * Barometer for X^2 (chi square) deviation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { ColorDef } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import BarometerNode from './BarometerNode.js';

// constants
const ARROW_OFFSET = 6;
const ARROW_HEAD_HEIGHT = 12;
const ARROW_HEAD_WIDTH = 8;
const ARROW_TAIL_WIDTH = 0.5;
const BAROMETER_HEIGHT = CurveFittingConstants.BAROMETER_AXIS_HEIGHT - ARROW_HEAD_HEIGHT - ARROW_OFFSET;
const BAROMETER_TICK_WIDTH = 10;
const MAX_CHI_SQUARED_VALUE = 100;

// arrays necessary for calculating chi value bounds while getting barometer color
const LOWER_LIMIT_ARRAY = [ 0.004, 0.052, 0.118, 0.178, 0.23, 0.273, 0.31, 0.342, 0.369, 0.394, 0.545, 0.695, 0.779, 0.927 ];
const UPPER_LIMIT_ARRAY = [ 3.8, 3, 2.6, 2.37, 2.21, 2.1, 2.01, 1.94, 1.88, 1.83, 1.57, 1.35, 1.24, 1.07 ];

class BarometerX2Node extends BarometerNode {

  /**
   * @param {Points} points
   * @param {Property.<number>} chiSquaredProperty - Property that represents x squared deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   */
  constructor( points, chiSquaredProperty, curveVisibleProperty ) {

    // sets up a map of position along barometer (a ratio from 0 to 1) to chi squared value (0, 0.5, 1, 2, 3, 10, 30, 100)
    const tickPositionsToLabels = { 0: '0' };
    [ 0.5, 1, 2, 3, 10, 30, 100 ].forEach( chiSquaredValue => {
      const chiSquaredPosition = chiSquaredValueToRatio( chiSquaredValue );
      tickPositionsToLabels[ chiSquaredPosition ] = chiSquaredValue;
    } );

    // links up listeners to properties that map chi squared values to fill ratios and colors
    // dispose unnecessary because BarometerX2 is present for the lifetime of the simulation
    const fillProportionProperty = new DerivedProperty( [ chiSquaredProperty ], chiSquaredValueToRatio, { valueType: 'number' } );
    const fillColorProperty = new DerivedProperty(
      [ chiSquaredProperty ],
      chiSquaredValue => getFillColorFromChiSquaredValue( chiSquaredValue, points.length ),
      { isValidValue: value => ColorDef.isColorDef( value ) }
    );

    // calls the superclass's constructor that initializes BarometerX2Node as a BarometerNode
    super( fillProportionProperty, curveVisibleProperty, tickPositionsToLabels, {
      fill: fillColorProperty,
      axisHeight: BAROMETER_HEIGHT,
      tickWidth: BAROMETER_TICK_WIDTH
    } );

    // adds the arrow to the top of this BarometerX2Node to show that the values can extend past 100
    const topArrow = new ArrowNode( 0, 0, 0, -BAROMETER_HEIGHT - ARROW_HEAD_HEIGHT * 1.5, {
      headHeight: ARROW_HEAD_HEIGHT,
      headWidth: ARROW_HEAD_WIDTH,
      tailWidth: ARROW_TAIL_WIDTH
    } );
    this.addChild( topArrow );
  }

}

/**
 * Convert X^2 values into barometer color depending on number of points.
 * This algorithm was copied directly from Flash simulation.
 *
 * @param {number} chiSquaredValue - X^2 value.
 * @param {number} numberOfPoints - Number of points on Graph.
 * @returns {string} rgb color string
 */
function getFillColorFromChiSquaredValue( chiSquaredValue, numberOfPoints ) {

  let red;
  let green;
  let blue;
  let lowerBound;
  let upperBound;

  if ( numberOfPoints >= 1 && numberOfPoints < 11 ) {
    lowerBound = LOWER_LIMIT_ARRAY[ numberOfPoints - 1 ];
    upperBound = UPPER_LIMIT_ARRAY[ numberOfPoints - 1 ];
  }
  else if ( numberOfPoints >= 11 || numberOfPoints < 20 ) {
    lowerBound = ( LOWER_LIMIT_ARRAY[ 9 ] + LOWER_LIMIT_ARRAY[ 10 ] ) / 2;
    upperBound = ( UPPER_LIMIT_ARRAY[ 9 ] + UPPER_LIMIT_ARRAY[ 10 ] ) / 2;
  }
  else if ( numberOfPoints >= 20 || numberOfPoints < 50 ) {
    lowerBound = ( LOWER_LIMIT_ARRAY[ 10 ] + LOWER_LIMIT_ARRAY[ 11 ] ) / 2;
    upperBound = ( UPPER_LIMIT_ARRAY[ 10 ] + UPPER_LIMIT_ARRAY[ 11 ] ) / 2;
  }
  else if ( numberOfPoints >= 50 ) {
    lowerBound = LOWER_LIMIT_ARRAY[ 12 ];
    upperBound = UPPER_LIMIT_ARRAY[ 12 ];
  }

  const step1 = ( 1 + upperBound ) / 2;
  const step2 = ( lowerBound + 1 ) / 2;
  const step3 = ( upperBound + step1 ) / 2;
  const step4 = ( lowerBound + step2 ) / 2;

  if ( chiSquaredValue < lowerBound ) {
    red = 0;
    green = 0;
    blue = 1;
  }
  else if ( chiSquaredValue >= lowerBound && chiSquaredValue < step4 ) {
    red = 0;
    green = ( chiSquaredValue - lowerBound ) / ( step4 - lowerBound );
    blue = 1;
  }
  else if ( chiSquaredValue >= step4 && chiSquaredValue < step2 ) {
    blue = ( step2 - chiSquaredValue ) / ( step2 - step4 );
    green = 1;
    red = 0;
  }
  else if ( chiSquaredValue >= step2 && chiSquaredValue <= step1 ) {
    red = 0;
    green = 1;
    blue = 0;
  }
  else if ( chiSquaredValue > step1 && chiSquaredValue < step3 ) {
    red = ( chiSquaredValue - step1 ) / ( step3 - step1 );
    green = 1;
    blue = 0;
  }
  else if ( chiSquaredValue >= step3 && chiSquaredValue < upperBound ) {
    red = 1;
    green = ( upperBound - chiSquaredValue ) / ( upperBound - step3 );
    blue = 0;
  }
  else if ( chiSquaredValue >= upperBound ) {
    red = 1;
    green = 0;
    blue = 0;
  }

  red *= 255;
  blue *= 255;
  green *= 255;

  return `rgb( ${Utils.roundSymmetric( red )}, ${Utils.roundSymmetric( green )}, ${Utils.roundSymmetric( blue )} )`;
}

/**
 * Convert X^2 value to a corresponding fill ratio
 * X^2 scales linearly when less than 1, and logarithmically afterwards
 *
 * @param {number} value - Barometer's X^2 value.
 * @returns {number} ratio between 0 and 1 for how much the barometer should be filled
 */
function chiSquaredValueToRatio( value ) {
  if ( value <= 1 ) {
    return value / ( 1 + Math.log( MAX_CHI_SQUARED_VALUE ) );
  }
  else {

    // logarithmic scaling for X^2 values greater than 1, but returned ratio is capped at 1.023
    // 1.023 is cap because bar can extend past top of barometer (see #136)
    // 1.023 was empirically determined to line up with arrow base
    return Math.min( 1.023, ( 1 + Math.log( value ) ) / ( 1 + Math.log( MAX_CHI_SQUARED_VALUE ) ) );
  }
}

curveFitting.register( 'BarometerX2Node', BarometerX2Node );
export default BarometerX2Node;
