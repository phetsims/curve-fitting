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
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VSlider = require( 'SUN/VSlider' );

  class CoefficientSliderNode extends VBox {

    /**
     * @param {Property.<number>} property parameter to track.
     * @param {Range} range - Possible range for property.
     * @param {string} label - Label for slider.
     * @param {Object} [options] for slider node.
     */
    constructor( property, range, label, options ) {
      options = _.extend( {
        trackFill: 'black',
        trackSize: new Dimension2( 120, 1 ),
        thumbSize: new Dimension2( 10, 20 ),
        minorTickLineWidth: 2,
        minorTickLength: 12,
        thumbTouchAreaYDilation: 4, // supposed to make touch horizontal areas flush; is YDilation since we rotate by 90; see #72
        thumbMouseAreaYDilation: 4,
        thumbMouseAreaXDilation: 10,
        labelOptions: {
          font: new PhetFont( {
            weight: 'bold',
            size: 13
          } ),
          fill: CurveFittingConstants.BLUE_COLOR
        }
      }, options );

      const sliderNode = new VSlider( property, range, options );

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

  curveFitting.register( 'CoefficientSliderNode', CoefficientSliderNode );

  return CoefficientSliderNode;
} );