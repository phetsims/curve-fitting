// Copyright 2015-2018, University of Colorado Boulder

/**
 * Barometer for r^2 deviation. Origin is at the origin of the y axis.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const RANGE = new Range( 0, 1 );
  const LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };
  const TICK_FONT = new PhetFont( 12 );

  /**
   * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerR2Node( rSquaredProperty, curveVisibleProperty,  options ) {

    // value shown on the barometer
    const valueRectNode = new Rectangle( 0, 0, CurveFittingConstants.BAROMETER_BAR_WIDTH, 0, {
      fill: CurveFittingConstants.BLUE_COLOR
    } );
    valueRectNode.rotation = Math.PI;

    const axis = new Line( 0, 0, 0, -CurveFittingConstants.BAROMETER_AXIS_HEIGHT, LINE_OPTIONS );

    Node.call( this, _.extend( {}, options, {
      children: [ valueRectNode, axis ]
    } ) );

    this.addTicks( [ 0, 0.25, 0.5, 0.75, 1 ] );

    // put a red dot at the origin
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Circle( 3, { fill: 'red' } ) );
    }

    // no need to unlink, present for the lifetime of the sim
    rSquaredProperty.link( rSquared => {
      valueRectNode.setRectHeight( ( RANGE.min + rSquared / RANGE.max ) * CurveFittingConstants.BAROMETER_AXIS_HEIGHT );
    } );
    curveVisibleProperty.linkAttribute( valueRectNode, 'visible');
  }

  curveFitting.register( 'BarometerR2Node', BarometerR2Node );

  return inherit( Node, BarometerR2Node, {

    //TODO #120 very similar to BarometerX2Node
    /**
     * Adds a tick.
     * @param {number} value
     * @private
     */
    addTick: function( value ) {

      //TODO #120 document this better, it's not clear why this is needed, duplicated in BarometerX2Node
      // expression "0.5 + ( CurveFittingConstants.BAROMETER_AXIS_HEIGHT - 1 )" need to prevent bad graph view in corners
      const y = 0.5 + ( CurveFittingConstants.BAROMETER_AXIS_HEIGHT - 1 ) * ( value - RANGE.min ) / ( RANGE.max - RANGE.min );

      // tick line
      const line = new Line( -CurveFittingConstants.BAROMETER_TICK_WIDTH, -y, 0, -y, LINE_OPTIONS );
      this.addChild( line );

      // tick label
      const label = new Text( value.toString(), {
        font: TICK_FONT,
        right: line.left - 2,
        centerY: line.centerY
      } );
      this.addChild( label );
    },

    //TODO #120 entirely duplicated in BarometerX2Node
    /**
     * Adds multiple ticks.
     * @param {number[]} values
     * @private
     */
    addTicks: function( values ) {
      const self = this;
      values.forEach( function( value ) {
        self.addTick( value );
      } );
    }
  } );
} );