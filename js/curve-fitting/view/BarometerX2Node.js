// Copyright 2002-2014, University of Colorado Boulder

/**
 * Barometer node for x^2 deviation in 'Curve Fitting' simulation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var RANGE = new Range( 0, 100 );
  var MIN_VALUE = RANGE.min;
  var MAX_VALUE = 1 + Math.log( RANGE.max );
  var HEAD_HEIGHT = 12;
  var HEIGHT = 200 - HEAD_HEIGHT;
  var LINE_OPTIONS = {
    lineWidth: 2,
    stroke: 'black'
  };
  var TICK_FONT = new PhetFont( 12 );
  var TICK_WIDTH = 15;

  /**
   * @param {Property} chiSquareProperty - Property that represents x-deviation.
   * @param {Property} chiFillProperty - Property that represents color of barometer.
   * @param {Object} options for graph node.
   * @constructor
   */
  function BarometerX2Node( chiSquareProperty, chiFillProperty, options ) {
    var valueRectNode = new Rectangle( -2 * TICK_WIDTH / 3 - 1, 0, 2 * TICK_WIDTH / 3, 0, { fill: CurveFittingConstants.BLUE_COLOR } );
    valueRectNode.rotation = Math.PI;

    Node.call( this, _.extend( {
      children: [
        new ArrowNode( 0, 0, 0, -HEIGHT - HEAD_HEIGHT * 1.5, {
          headHeight: HEAD_HEIGHT,
          headWidth: 8,
          tailWidth: 1
        } ),
        valueRectNode
      ]
    }, options ) );

    this.addTicks( [ 0, 0.5, 1, 2, 3, 10, 30, 100 ] );

    chiSquareProperty.link( function( chiSquare ) {
      valueRectNode.setRectHeight( valueToYPosition( chiSquare ) );
    } );

    chiFillProperty.link( function( chiFill ) {
      valueRectNode.setFill( chiFill );
    } );
  }

  var valueToYPosition = function( value ) {
    if ( value <= 1 ) {
      return HEIGHT * (MIN_VALUE + (value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE));
    }
    else {
      return HEIGHT * (MIN_VALUE + 1 + Math.log( value - MIN_VALUE )) / (MAX_VALUE - MIN_VALUE);
    }
  };

  return inherit( Node, BarometerX2Node, {
    // add single tick
    addTick: function( value ) {
      var y = valueToYPosition( value );

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