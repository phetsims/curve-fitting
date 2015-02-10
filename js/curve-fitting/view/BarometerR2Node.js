// Copyright 2002-2014, University of Colorado Boulder

/**
 * Barometer node for r^2 deviation in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var HEIGHT = 200;
  var RANGE = new Range( 0, 1 );
  var LINE_OPTIONS = {
    lineWidth: 2,
    stroke: 'black'
  };
  var TICK_FONT = new PhetFont( 12 );
  var TICK_WIDTH = 15;

  /**
   * @param {Property} rSquareProperty - Property that represents r-deviation.
   * @param {Object} options for graph node.
   * @constructor
   */
  function BarometerR2Node( rSquareProperty, options ) {
    var rectValue = new Rectangle( -2 * TICK_WIDTH / 3, 0, 2 * TICK_WIDTH / 3, 0, { fill: CurveFittingConstants.BLUE_COLOR } );
    rectValue.rotation = Math.PI;

    Node.call( this, _.extend( {
      children: [
        // axis
        new Line( 0, 0, 0, -HEIGHT, LINE_OPTIONS ),

        // barometer value
        rectValue
      ]
    }, options ) );

    this.addTicks( [ 0, 0.25, 0.5, 0.75, 1 ] );

    // add observer
    rSquareProperty.link( function( rSquare ) {
      rectValue.setRectHeight( (RANGE.min + rSquare / RANGE.max) * HEIGHT );
    } );
  }

  return inherit( Node, BarometerR2Node, {
    // add single tick
    addTick: function( value ) {
      var y = HEIGHT * (value - RANGE.min) / (RANGE.max - RANGE.min);

      // add label
      var label = new Text( value.toString(), { font: TICK_FONT, centerY: -y } );
      label.centerX = -label.width / 2 - 3;
      this.addChild( label );

      // add tick
      this.addChild( new Line( 0, -y, TICK_WIDTH, -y, LINE_OPTIONS ) );
    },

    // add array of tick
    addTicks: function( arrayOfTicks ) {
      var self = this;
      arrayOfTicks.forEach( function( tickValue ) {
        self.addTick( tickValue );
      } );
    }
  } );
} );