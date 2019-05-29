// Copyright 2015-2018, University of Colorado Boulder

/**
 * Barometer for r^2 deviation. Origin is at the origin of the y axis.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const BarometerNode = require( 'CURVE_FITTING/curve-fitting/view/BarometerNode' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );

  class BarometerR2Node extends BarometerNode {

    /**
     * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Object} [options] for graph node.
     */
    constructor( rSquaredProperty, curveVisibleProperty,  options ) {

      const tickLocationsToLabels = {
        0: '0',
        0.25: '0.25',
        0.5: '0.5',
        0.75: '0.75',
        1: '1'
      };

      super( rSquaredProperty, curveVisibleProperty, tickLocationsToLabels, {
        fill: 'blue'
      } );

      // put a red dot at the origin
      if ( phet.chipper.queryParameters.dev ) {
        this.addChild( new Circle( 3, { fill: 'red' } ) );
      }

    }

  }

  curveFitting.register( 'BarometerR2Node', BarometerR2Node );

  return BarometerR2Node;
} );