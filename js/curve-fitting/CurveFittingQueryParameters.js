// Copyright 2017-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */

import curveFitting from '../curveFitting.js';

const CurveFittingQueryParameters = window.QueryStringMachine.getAll( {

  // Determines whether dragged points should be placed such that their coordinates are rounded to the nearest 1.
  // For internal use only, not public facing.
  snapToGrid: {
    type: 'boolean',
    defaultValue: false
  }

} );

curveFitting.register( 'CurveFittingQueryParameters', CurveFittingQueryParameters );
export default CurveFittingQueryParameters;