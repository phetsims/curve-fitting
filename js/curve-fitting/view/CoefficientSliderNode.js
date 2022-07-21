// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node with single parameter slider in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import VSlider from '../../../../sun/js/VSlider.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

// constants
const SLIDER_OPTIONS = {
  trackFill: 'black',
  trackSize: new Dimension2( 1, 120 ),
  thumbSize: new Dimension2( 20, 10 ),
  minorTickLineWidth: 2,
  minorTickLength: 12,
  thumbTouchAreaXDilation: 8, // supposed to make touch horizontal areas flush; see #72
  thumbMouseAreaXDilation: 8,
  thumbMouseAreaYDilation: 10
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

    options = merge( {
      sliderOptions: SLIDER_OPTIONS,
      labelOptions: LABEL_OPTIONS
    }, options );

    const sliderNode = new VSlider( property, range, options.sliderOptions );

    // add central tick
    sliderNode.addMinorTick( 0, '' );

    super( merge( {
      children: [
        sliderNode,
        new Text( label, options.labelOptions )
      ]
    }, options ) );
  }

}

curveFitting.register( 'CoefficientSliderNode', CoefficientSliderNode );
export default CoefficientSliderNode;