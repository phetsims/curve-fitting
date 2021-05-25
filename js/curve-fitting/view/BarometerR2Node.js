// Copyright 2015-2021, University of Colorado Boulder

/**
 * Barometer for r^2 deviation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import curveFitting from '../../curveFitting.js';
import BarometerNode from './BarometerNode.js';

class BarometerR2Node extends BarometerNode {

  /**
   * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for graph node.
   */
  constructor( rSquaredProperty, curveVisibleProperty, options ) {

    options = merge( {
      fill: 'blue',
      tickWidth: 20
    }, options );

    const tickPositionsToLabels = {
      0: '0',
      0.25: '0.25',
      0.5: '0.5',
      0.75: '0.75',
      1: '1'
    };

    // Property that maps rSquared -> rSquared, unless rSquared is NaN, where it maps NaN -> 0
    // No dispose necessary, present for the lifetime of the sim
    const modifiedRSquaredProperty = new DerivedProperty(
      [ rSquaredProperty ],
      rSquared => isNaN( rSquared ) ? 0 : rSquared,
      { valueType: 'number', isValidValue: value => value >= 0 && value <= 1 }
    );

    super( modifiedRSquaredProperty, curveVisibleProperty, tickPositionsToLabels, options );

  }

}

curveFitting.register( 'BarometerR2Node', BarometerR2Node );
export default BarometerR2Node;
