// Copyright 2015, University of Colorado Boulder

/**
 * Node with single parameter slider in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HSlider = require( 'SUN/HSlider' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // constants
  var FONT = new PhetFont( {
    weight: 'bold',
    size: 13
  } );

  /**
   * @param {Property.<number>} property parameter to track.
   * @param {Range} range - Possible range for property.
   * @param {string} label - Label for slider.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function SliderParameterNode( property, range, label, options ) {
    // enabled property changes with each slider
    var sliderOptions = {
      trackFill: 'black',
      trackSize: new Dimension2( 120, 1 ),
      thumbSize: new Dimension2( 15, 24 ),
      minorTickLineWidth: 2,
      enabledProperty: options.enabledProperty,
      thumbNodeTouchAreaXDilation: 5,
      thumbNodeTouchAreaYDilation: 1.5
    };
    var sliderNode = new HSlider( property, range, sliderOptions );

    // make vertical slider
    sliderNode.rotate( -Math.PI / 2 );

    // add central tick
    sliderNode.addMinorTick( 0, '' );

    VBox.call( this, _.extend( {
      resize: false,
      children: [
        // necessary to prevent expanding box by thumb
        new VStrut( sliderOptions.thumbSize.width / 2 ),

        sliderNode,

        // necessary to prevent expanding box by thumb
        new VStrut( sliderOptions.thumbSize.width / 2 ),
        new Text( label, { font: FONT, fill: CurveFittingConstants.BLUE_COLOR } )
      ]
    }, options ) );
  }

  curveFitting.register( 'SliderParameterNode', SliderParameterNode );

  return inherit( VBox, SliderParameterNode );
} );