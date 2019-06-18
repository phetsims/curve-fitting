// Copyright 2015-2019, University of Colorado Boulder

/**
 * Barometer for r^2 deviation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const BarometerNode = require( 'CURVE_FITTING/curve-fitting/view/BarometerNode' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );

  // constants
  const TICK_WIDTH = 20;

  class BarometerR2Node extends BarometerNode {

    /**
     * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options] for graph node.
     */
    constructor( rSquaredProperty, curveVisibleProperty, options ) {

      const tickLocationsToLabels = {
        0: '0',
        0.25: '0.25',
        0.5: '0.5',
        0.75: '0.75',
        1: '1'
      };

      // property that maps rSquared -> rSquared, unless rSquared is NaN, where it maps NaN -> 0
      const modifiedRSquaredProperty = new DerivedProperty(
        [ rSquaredProperty ],
        rSquared => isNaN( rSquared ) ? 0 : rSquared
      );

      super( modifiedRSquaredProperty, curveVisibleProperty, tickLocationsToLabels, {
        fill: 'blue',
        tickWidth: TICK_WIDTH
      } );

    }

  }

  curveFitting.register( 'BarometerR2Node', BarometerR2Node );

  return BarometerR2Node;
} );