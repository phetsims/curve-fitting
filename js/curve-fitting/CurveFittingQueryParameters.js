// Copyright 2017-2019, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );

  const CurveFittingQueryParameters = window.QueryStringMachine.getAll( {

    // determines whether dragged points should be placed such that their coordinates are rounded to the nearest 1
    snapToGrid: {
      type: 'boolean',
      defaultValue: false
    }

  } );

  curveFitting.register( 'CurveFittingQueryParameters', CurveFittingQueryParameters );

  return CurveFittingQueryParameters;
} );