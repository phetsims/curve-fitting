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
  const merge = require( 'PHET_CORE/merge' );

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

      const tickLocationsToLabels = {
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
        { valueType: 'number', isValidValue: value => 0 <= value && value <= 1 }
      );

      super( modifiedRSquaredProperty, curveVisibleProperty, tickLocationsToLabels, options );

    }

  }

  return curveFitting.register( 'BarometerR2Node', BarometerR2Node );
} );
