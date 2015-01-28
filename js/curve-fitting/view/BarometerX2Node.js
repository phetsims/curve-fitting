// Copyright 2002-2014, University of Colorado Boulder

/**
 * Barometer node for x^2 deviation in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var HEAD_HEIGHT = 12;
  var HEIGHT = 200;
  var RANGE = new Range( 0, 100 );
  var LINE_OPTIONS = {
    lineWidth: 2,
    stroke: 'black'
  };
  var TICK_FONT = new PhetFont( 12 );
  var TICK_WIDTH = 15;

  /**
   * @param {Property} deviationXProperty - Property that represents r-deviation.
   * @param {Object} options for graph node.
   * @constructor
   */
  function BarometerR2Node( deviationXProperty, options ) {
    Node.call( this, _.extend( {
      children: [
        new ArrowNode( 0, 0, 0, -HEIGHT - HEAD_HEIGHT * 1.5, {
          headHeight: HEAD_HEIGHT,
          headWidth: 8,
          tailWidth: 1
        } )
      ]
    }, options ) );

    this.addTicks( [ 0, 0.5, 1, 2, 3, 10, 30, 100 ] );
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