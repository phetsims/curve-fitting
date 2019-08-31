// Copyright 2015-2019, University of Colorado Boulder

/**
 * Node with single parameter slider in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VSlider = require( 'SUN/VSlider' );

  // constants
  const SLIDER_OPTIONS = {
    trackFill: 'black',
    trackSize: new Dimension2( 120, 1 ),
    thumbSize: new Dimension2( 10, 20 ),
    minorTickLineWidth: 2,
    minorTickLength: 12,
    thumbTouchAreaYDilation: 8, // supposed to make touch horizontal areas flush; is YDilation since we rotate by 90; see #72
    thumbMouseAreaYDilation: 8,
    thumbMouseAreaXDilation: 10
  };
  const LABEL_OPTIONS = {
    font: CurveFittingConstants.COEFFICIENT_FONT,
    fill: CurveFittingConstants.BLUE_COLOR,
    maxWidth: 20
  };

  class CoefficientSliderNode extends VBox {

    /**
     * @param {Property.<number>} property - parameter to track.
     * @param {Range} range - Possible range for Property.
     * @param {string} label - Label for slider.
     * @param {Object} [options] for slider node.
     */
    constructor( property, range, label, options ) {

      options = _.extend( {
        sliderOptions: SLIDER_OPTIONS,
        labelOptions: LABEL_OPTIONS
      }, options );

      const sliderNode = new VSlider( property, range, options.sliderOptions );

      // add central tick
      sliderNode.addMinorTick( 0, '' );

      super( _.extend( {
        children: [
          sliderNode,
          new Text( label, options.labelOptions )
        ]
      }, options ) );
    }

  }

  return curveFitting.register( 'CoefficientSliderNode', CoefficientSliderNode );
} );