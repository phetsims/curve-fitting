// Copyright 2015-2019, University of Colorado Boulder

/**
 * Barometer for x^2 (chi square) deviation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const BarometerNode = require( 'CURVE_FITTING/curve-fitting/view/BarometerNode' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Range = require( 'DOT/Range' );
  const Util = require( 'DOT/Util' );

  // constants
  const OFFSET = 6;
  const RANGE = new Range( 0, 100 );
  const MIN_VALUE = RANGE.min;
  const MAX_VALUE = 1 + Math.log( RANGE.max );
  const HEAD_HEIGHT = 12;
  const BAR_HEIGHT = CurveFittingConstants.BAROMETER_AXIS_HEIGHT - HEAD_HEIGHT - OFFSET;

  // arrays necessary for calculating chi value bounds while getting barometer color
  const LOWER_LIMIT_ARRAY = [ 0.004, 0.052, 0.118, 0.178, 0.23, 0.273, 0.31, 0.342, 0.369, 0.394, 0.545, 0.695, 0.779, 0.927 ];
  const UPPER_LIMIT_ARRAY = [ 3.8, 3, 2.6, 2.37, 2.21, 2.1, 2.01, 1.94, 1.88, 1.83, 1.57, 1.35, 1.24, 1.07 ];

  class BarometerX2Node extends BarometerNode {

    /**
     * @param {Points} points
     * @param {Property.<number>} chiSquaredProperty - Property that represents x squared deviation.
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options] for graph node.
     */
    constructor( points, chiSquaredProperty, curveVisibleProperty,  options ) {

      // sets up a map of location along barometer (a ratio from 0 to 1) to chi squared value (0, 0.5, 1, 2, 3, 10, 30, 100)
      const tickLocationsToLabels = {};
      [ 0, 0.5, 1, 2, 3, 10, 30, 100 ].forEach( chiSquaredValue => {
        const chiSquaredLocation = chiSquaredValueToRatio( chiSquaredValue );
        tickLocationsToLabels[ chiSquaredLocation ] = chiSquaredValue;
      } );

      // links up listeners to properties that map chi squared values to fill ratios and colors
      const fillProportionProperty = new DerivedProperty( [ chiSquaredProperty ], chiSquaredValueToRatio );
      const chiSquaredValueToFillColor = chiSquaredValue => getFillColorFromChiSquaredValue( chiSquaredValue, points.length );
      const fillColorProperty = new DerivedProperty( [ chiSquaredProperty ], chiSquaredValueToFillColor );

      // calls the superconstructor that initializes BarometerX2Node as a BarometerNode
      super( fillProportionProperty, curveVisibleProperty, tickLocationsToLabels, {
        fill: fillColorProperty,
        axisHeight: BAR_HEIGHT
      } );

      // @private {Function}
      this.disposeChiSquaredListeners = () => {
        fillProportionProperty.unlink( chiSquaredValueToRatio );
        fillColorProperty.unlink( chiSquaredValueToFillColor );
      };

      // adds the arrow to the top of this BarometerX2Node to show that the values can extend past 100
      const topArrow = new ArrowNode( 0, 0, 0, -BAR_HEIGHT - HEAD_HEIGHT * 1.5, {
        headHeight: HEAD_HEIGHT,
        headWidth: 8,
        tailWidth: 0.5
      } );
      this.addChild( topArrow );
    }

    /**
     * @override
     * @public
     */
    dispose() {
      this.disposeChiSquaredListeners();
      super.dispose();
    }

  }

  curveFitting.register( 'BarometerX2Node', BarometerX2Node );

  /**
   * Convert X^2 values into barometer color depending on number of points.
   * This algorithm was copied directly from Flash simulation.
   *
   * @param {number} chiSquaredValue - X^2 value.
   * @param {number} numberOfPoints - Number of points on Graph.
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
      blue = 255;
    }
    else if ( chiSquaredValue >= lowerBound && chiSquaredValue < step4 ) {
      red = 0;
      green = 255 * ( chiSquaredValue - lowerBound ) / ( step4 - lowerBound );
      blue = 255;
    }
    else if ( chiSquaredValue >= step4 && chiSquaredValue < step2 ) {
      blue = 255 * ( step2 - chiSquaredValue ) / ( step2 - step4 );
      green = 255;
      red = 0;
    }
    else if ( chiSquaredValue >= step2 && chiSquaredValue <= step1 ) {
      red = 0;
      green = 255;
      blue = 0;
    }
    else if ( chiSquaredValue > step1 && chiSquaredValue < step3 ) {
      red = 255 * ( chiSquaredValue - step1 ) / ( step3 - step1 );
      green = 255;
      blue = 0;
    }
    else if ( chiSquaredValue >= step3 && chiSquaredValue < upperBound ) {
      red = 255;
      green = 255 * ( upperBound - chiSquaredValue ) / ( upperBound - step3 );
      blue = 0;
    }
    else if ( chiSquaredValue >= upperBound ) {
      red = 255;
      green = 0;
      blue = 0;
    }

    return 'rgb(' + Util.roundSymmetric( red ) + ', ' + Util.roundSymmetric( green ) + ', ' + Util.roundSymmetric( blue ) + ')';
  }

  /**
   * Convert X^2 value to a corresponding fill ratio
   * TODO: understand/simplify these calculations
   *
   * @param {number} value - Barometer's X^2 value.
   * @returns {number} ratio between 0 to 1 for how much the barometer should be filled
   */
  function chiSquaredValueToRatio( value ) {
    if ( value <= 1 ) {
      // expression "0.5 + ( BAR_HEIGHT - 1 )" need to prevent bad graph view in corners
      return ( 0.5 + ( BAR_HEIGHT - 1 ) * ( MIN_VALUE + ( value - MIN_VALUE ) / ( MAX_VALUE - MIN_VALUE ) ) ) / BAR_HEIGHT;
    }
    else {
      // logarithmic scaling for X^2 values greater than 1, but returned ratio is capped at 1
      return Math.min( 1, ( MIN_VALUE + 1 + Math.log( value - MIN_VALUE )) / ( MAX_VALUE - MIN_VALUE ) );
    }
  }

  return BarometerX2Node;
} );