// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node with fit types and adjusting sliders in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HSlider = require( 'SUN/HSlider' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  var FONT = new PhetFont( {
    weight: 'bold',
    size: 13
  } );
  var SLIDER_OPTIONS = {
    trackFill: 'black',
    trackSize: new Dimension2( 140, 1 ),
    thumbSize: new Dimension2( 16, 26 )
  };
  var TICK_COLOR = 'black';
  var TICK_LENGTH = 8;
  var TICK_WIDTH = 2;

  /**
   * @param {Property} property parameter to track.
   * @param {Range} range - Possible range for property.
   * @param {string} label - Label for slider.
   * @param {Object} options for slider node.
   * @constructor
   */
  function SliderParameterNode( property, range, label, options ) {
    var sliderNode = new HSlider( property, range, SLIDER_OPTIONS );

    // make vertical slider
    sliderNode.rotate( -Math.PI / 2 );

    // add central tick
    sliderNode.addTick( 0, '', TICK_LENGTH, TICK_COLOR, TICK_WIDTH );
    sliderNode.addTick( 0, '', -TICK_LENGTH - 2 * SLIDER_OPTIONS.trackSize.height, TICK_COLOR, TICK_WIDTH );

    VBox.call( this, _.extend( {
      children: [
        sliderNode,
        new Text( label, { font: FONT, fill: CurveFittingConstants.BLUE_COLOR } )
      ]
    }, options ) );
  }

  return inherit( VBox, SliderParameterNode );
} );