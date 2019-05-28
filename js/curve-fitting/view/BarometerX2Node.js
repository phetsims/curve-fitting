// Copyright 2015-2019, University of Colorado Boulder

/**
 * Barometer for x^2 (chi square) deviation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const FONT_SIZE = 12;
  const TICK_FONT = new PhetFont( FONT_SIZE );
  const OFFSET = FONT_SIZE / 2;
  const RANGE = new Range( 0, 100 );
  const MIN_VALUE = RANGE.min;
  const MAX_VALUE = 1 + Math.log( RANGE.max );
  const HEAD_HEIGHT = 12;
  const BAR_HEIGHT = CurveFittingConstants.BAROMETER_AXIS_HEIGHT - HEAD_HEIGHT - OFFSET;
  const LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };

  // arrays necessary for calculating chi value bounds while getting barometer color
  const LOWER_LIMIT_ARRAY = [ 0.004, 0.052, 0.118, 0.178, 0.23, 0.273, 0.31, 0.342, 0.369, 0.394, 0.545, 0.695, 0.779, 0.927 ];
  const UPPER_LIMIT_ARRAY = [ 3.8, 3, 2.6, 2.37, 2.21, 2.1, 2.01, 1.94, 1.88, 1.83, 1.57, 1.35, 1.24, 1.07 ];

  class BarometerX2Node extends VBox {

    /**
     * @param {Points} points
     * @param {Property.<number>} chiSquaredProperty - Property that represents x squared deviation.
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options] for graph node.
     */
    constructor( points, chiSquaredProperty, curveVisibleProperty,  options ) {

      const valueRectNode = new Rectangle( 0, 0, CurveFittingConstants.BAROMETER_BAR_WIDTH, 0, {
        fill: 'black' // to be computed by getChiFillFromChiValue
      } );
      valueRectNode.rotation = Math.PI;

      //TODO #120 why are this._contentNode, OFFSET, and VStrut needed? This smells like a workaround for something.
      const content = new Node( {
        children: [
          valueRectNode,
          new ArrowNode( 0, 0, 0, -BAR_HEIGHT - HEAD_HEIGHT * 1.5, {
            headHeight: HEAD_HEIGHT,
            headWidth: 8,
            tailWidth: 0.5
          } )
        ]
      } );

      super( _.extend( {
        children: [
          content
        ]
      }, options ) );

      this._content = content;

      this.addTicks( [ 0, 0.5, 1, 2, 3, 10, 30, 100 ] );

      // no need to unlink, present for the lifetime of the sim
      chiSquaredProperty.link( chiSquared => {
        valueRectNode.setRectHeight( valueToYPosition( chiSquared ) );
        valueRectNode.setFill( getChiFillFromChiValue( chiSquaredProperty.value, points.getNumberPointsOnGraph() ) );
      } );

      curveVisibleProperty.linkAttribute( valueRectNode, 'visible' );
    }

    //TODO #120 very similar to BarometerR2Node, but adds children to this._content
    /**
     * Adds a tick.
     *
     * @param {number} value
     */
    addTick( value ) {

      const y = valueToYPosition( value );

      // tick line
      const line = new Line( -CurveFittingConstants.BAROMETER_TICK_WIDTH, -y, 0, -y, LINE_OPTIONS );
      this._content.addChild( line );

      // tick label
      const label = new Text( value.toString(), {
        font: TICK_FONT,
        right: line.left - 2,
        centerY: line.centerY
      } );
      this._content.addChild( label );
    }

    //TODO #120 entirely duplicated in BarometerR2Node
    /**
     * Adds multiple ticks.
     *
     * @param {number[]} values
     */
    addTicks( values ) {
      values.forEach( value => {
        this.addTick( value );
      } );
    }

  }

  curveFitting.register( 'BarometerX2Node', BarometerX2Node );

  /**
   * Convert chi values into barometer color depending on number of points.
   * This algorithm was copied directly from Flash simulation.
   *
   * @param {number} chiValue - Chi value.
   * @param {number} numberOfPoints - Number of points on Graph.
   */
  function getChiFillFromChiValue( chiValue, numberOfPoints ) {

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

    if ( chiValue < lowerBound ) {
      red = 0;
      green = 0;
      blue = 255;
    }
    else if ( chiValue >= lowerBound && chiValue < step4 ) {
      red = 0;
      green = 255 * ( chiValue - lowerBound ) / ( step4 - lowerBound );
      blue = 255;
    }
    else if ( chiValue >= step4 && chiValue < step2 ) {
      blue = 255 * ( step2 - chiValue ) / ( step2 - step4 );
      green = 255;
      red = 0;
    }
    else if ( chiValue >= step2 && chiValue <= step1 ) {
      red = 0;
      green = 255;
      blue = 0;
    }
    else if ( chiValue > step1 && chiValue < step3 ) {
      red = 255 * ( chiValue - step1 ) / ( step3 - step1 );
      green = 255;
      blue = 0;
    }
    else if ( chiValue >= step3 && chiValue < upperBound ) {
      red = 255;
      green = 255 * ( upperBound - chiValue ) / ( upperBound - step3 );
      blue = 0;
    }
    else if ( chiValue >= upperBound ) {
      red = 255;
      green = 0;
      blue = 0;
    }

    return 'rgb(' + Util.roundSymmetric( red ) + ', ' + Util.roundSymmetric( green ) + ', ' + Util.roundSymmetric( blue ) + ')';
  }

  /**
   * Convert X^2 value to corresponding y coordinate.
   *
   * @param {number} value - Barometer's X^2 value.
   * @returns {number}
   */
  function valueToYPosition( value ) {
    if ( value <= 1 ) {
      //TODO #120 document this better, it's not clear why this is needed, duplicated in BarometerR2Node
      // expression "0.5 + ( BAR_HEIGHT - 1 )" need to prevent bad graph view in corners
      return 0.5 + ( BAR_HEIGHT - 1 ) * ( MIN_VALUE + ( value - MIN_VALUE ) / ( MAX_VALUE - MIN_VALUE ));
    }
    else {
      return Math.min( BAR_HEIGHT, BAR_HEIGHT * ( MIN_VALUE + 1 + Math.log( value - MIN_VALUE )) / ( MAX_VALUE - MIN_VALUE ) );
    }
  }

  return BarometerX2Node;
} );