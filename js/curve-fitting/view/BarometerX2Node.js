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
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // constants
  var FONT_SIZE = 12;
  var TICK_FONT = new PhetFont( FONT_SIZE );
  var OFFSET = FONT_SIZE / 2;
  var RANGE = new Range( 0, 100 );
  var MIN_VALUE = RANGE.min;
  var MAX_VALUE = 1 + Math.log( RANGE.max );
  var HEAD_HEIGHT = 12;
  var HEIGHT = CurveFittingConstants.BAROMETER_HEIGHT - HEAD_HEIGHT - OFFSET;
  var LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };


  /**
   * @param {Property.<number>} chiSquareProperty - Property that represents x-deviation.
   * @param {Property.<string>} chiFillProperty - Property that represents color of barometer.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerX2Node( chiSquareProperty, chiFillProperty, options ) {
    var valueRectNode = new Rectangle( -2 * CurveFittingConstants.BAROMETER_TICK_WIDTH / 3 - 0.5, 0, 2 * CurveFittingConstants.BAROMETER_TICK_WIDTH / 3, 0, { fill: CurveFittingConstants.BLUE_COLOR } );
    valueRectNode.rotation = Math.PI;

    this._content = new Node( {
      children: [
        valueRectNode,
        new ArrowNode( 0, 0, 0, -HEIGHT - HEAD_HEIGHT * 1.5, {
          headHeight: HEAD_HEIGHT,
          headWidth: 8,
          tailWidth: 0.5
        } )
      ]
    } );

    VBox.call( this, _.extend( {
      children: [
        new VStrut( OFFSET ),
        this._content
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
      // expression "0.5 + ( HEIGHT - 1 )" need to prevent bad graph view in corners
      return 0.5 + ( HEIGHT - 1 ) * ( MIN_VALUE + ( value - MIN_VALUE ) / ( MAX_VALUE - MIN_VALUE ));
    }
    else {
      return Math.min( HEIGHT, HEIGHT * ( MIN_VALUE + 1 + Math.log( value - MIN_VALUE )) / ( MAX_VALUE - MIN_VALUE ) );
    }
  };

  return inherit( VBox, BarometerX2Node, {
    // add single tick
    addTick: function( value ) {
      var y = valueToYPosition( value );
      var tickWidth;

      // add label
      var label = new Text( value.toString(), { font: TICK_FONT, centerY: -y } );
      label.centerX = -label.width / 2 - 3;
      this._content.addChild( label );

      // add tick
      if ( value === 0 ) {
        tickWidth = CurveFittingConstants.BAROMETER_TICK_WIDTH;
      }
      else {
        tickWidth = CurveFittingConstants.BAROMETER_TICK_WIDTH / 2;
      }
      this._content.addChild( new Line( -0.5, -y, tickWidth, -y, LINE_OPTIONS ) );
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