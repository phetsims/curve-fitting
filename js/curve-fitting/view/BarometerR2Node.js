// Copyright 2015-2017, University of Colorado Boulder

/**
 * Barometer for r^2 deviation. Origin is at the origin of the y axis.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var RANGE = new Range( 0, 1 );
  var LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };
  var TICK_FONT = new PhetFont( 12 );

  /**
   * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerR2Node( rSquaredProperty, curveVisibleProperty,  options ) {

    // value shown on the barometer
    var valueRectNode = new Rectangle( 0, 0, CurveFittingConstants.BAROMETER_BAR_WIDTH, 0, {
      fill: CurveFittingConstants.BLUE_COLOR
    } );
    valueRectNode.rotation = Math.PI;

    var axis = new Line( 0, 0, 0, -CurveFittingConstants.BAROMETER_AXIS_HEIGHT, LINE_OPTIONS );

    Node.call( this, _.extend( {}, options, {
      children: [ valueRectNode, axis ]
    } ) );

    this.addTicks( [ 0, 0.25, 0.5, 0.75, 1 ] );

    // put a red dot at the origin
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Circle( 3, { fill: 'red' } ) );
    }

    // no need to unlink, present for the lifetime of the sim
    rSquaredProperty.link( function( rSquared ) {
      valueRectNode.setRectHeight( ( RANGE.min + rSquared / RANGE.max ) * CurveFittingConstants.BAROMETER_AXIS_HEIGHT );
    } );
    curveVisibleProperty.linkAttribute( valueRectNode, 'visible');
  }

  curveFitting.register( 'BarometerR2Node', BarometerR2Node );

  return inherit( Node, BarometerR2Node, {

    //TODO very similar to BarometerX2Node
    /**
     * Adds a tick.
     * @param {number} value
     * @private
     */
    addTick: function( value ) {

      //TODO document this better, it's not clear why this is needed, duplicated in BarometerX2Node
      // expression "0.5 + ( CurveFittingConstants.BAROMETER_AXIS_HEIGHT - 1 )" need to prevent bad graph view in corners
      var y = 0.5 + ( CurveFittingConstants.BAROMETER_AXIS_HEIGHT - 1 ) * ( value - RANGE.min ) / ( RANGE.max - RANGE.min );

      // tick line
      var line = new Line( -CurveFittingConstants.BAROMETER_TICK_WIDTH, -y, 0, -y, LINE_OPTIONS );
      this.addChild( line );

      // tick label
      var label = new Text( value.toString(), {
        font: TICK_FONT,
        right: line.left - 2,
        centerY: line.centerY
      } );
      this.addChild( label );
    },

    //TODO entirely duplicated in BarometerX2Node
    /**
     * Adds multiple ticks.
     * @param {number[]} values
     * @private
     */
    addTicks: function( values ) {
      var self = this;
      values.forEach( function( value ) {
        self.addTick( value );
      } );
    }
  } );
} );