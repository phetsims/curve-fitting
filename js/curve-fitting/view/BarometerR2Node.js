// Copyright 2015-2016, University of Colorado Boulder

/**
 * Barometer for r^2 deviation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var RANGE = new RangeWithValue( 0, 1 );
  var LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };
  var TICK_FONT = new PhetFont( 12 );

  /**
   * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerR2Node( rSquaredProperty, options ) {

    // value shown on the barometer
    var valueRectNode = new Rectangle(
      -2 * CurveFittingConstants.BAROMETER_TICK_WIDTH / 3 - 0.5, 0,
      2 * CurveFittingConstants.BAROMETER_TICK_WIDTH / 3, 0, {
        fill: CurveFittingConstants.BLUE_COLOR
      } );
    valueRectNode.rotation = Math.PI;

    var axis = new Line( 0, 0, 0, -CurveFittingConstants.BAROMETER_HEIGHT, LINE_OPTIONS );

    Node.call( this, _.extend( {}, options, {
      children: [ valueRectNode, axis ]
    } ) );

    this.addTicks( [ 0, 0.25, 0.5, 0.75, 1 ] );

    //TODO unlink?
    rSquaredProperty.link( function( rSquared ) {
      valueRectNode.setRectHeight( ( RANGE.min + rSquared / RANGE.max ) * CurveFittingConstants.BAROMETER_HEIGHT );
    } );
  }

  curveFitting.register( 'BarometerR2Node', BarometerR2Node );

  return inherit( Node, BarometerR2Node, {

    /**
     * Adds a tick.
     *
     * @param {number} value
     */
    addTick: function( value ) {

      // expression "0.5 + ( CurveFittingConstants.BAROMETER_HEIGHT - 1 )" need to prevent bad graph view in corners
      var y = 0.5 + ( CurveFittingConstants.BAROMETER_HEIGHT - 1 ) * ( value - RANGE.min ) / ( RANGE.max - RANGE.min );

      // label
      var label = new Text( value.toString(), { font: TICK_FONT, centerY: -y } );
      label.centerX = -label.width / 2 - 3;
      this.addChild( label );

      // tick
      this.addChild( new Line( -0.5, -y, CurveFittingConstants.BAROMETER_TICK_WIDTH, -y, LINE_OPTIONS ) );
    },

    /**
     * Adds multiple ticks.
     *
     * @param {number[]} values
     */
    addTicks: function( values ) {
      var self = this;
      values.forEach( function( value ) {
        self.addTick( value );
      } );
    }
  } );
} );