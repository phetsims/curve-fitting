// Copyright 2015-2018, University of Colorado Boulder

/**
 * Node with single parameter slider in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VSlider = require( 'SUN/VSlider' );

  // constants
  const LABEL_OPTIONS = {
    font: new PhetFont( {
      weight: 'bold',
      size: 13
    } ),
    fill: CurveFittingConstants.BLUE_COLOR
  };

  /**
   * @param {Property.<number>} property parameter to track.
   * @param {Range} range - Possible range for property.
   * @param {string} label - Label for slider.
   * @param {Object} [options] for slider node.
   * @constructor
   */
  function CoefficientSliderNode( property, range, label, options ) {

    options = _.extend( {
        trackFill: 'black',
        trackSize: new Dimension2( 120, 1 ),
        thumbSize: new Dimension2( 15, 24 ),
        minorTickLineWidth: 2,
        thumbTouchAreaYDilation: 1   // small such that touch areas of adjacent sliders don't overlap. It is YDilation since we rotate by 90
      }, options );

    const sliderNode = new VSlider( property, range, options );

    // add central tick
    sliderNode.addMinorTick( 0, '' );

    VBox.call( this, _.extend( {
      children: [
        sliderNode,
        new Text( label, LABEL_OPTIONS )
      ]
    }, options ) );
  }

  curveFitting.register( 'CoefficientSliderNode', CoefficientSliderNode );

  return inherit( VBox, CoefficientSliderNode );
} );