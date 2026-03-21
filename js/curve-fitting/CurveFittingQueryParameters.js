// Copyright 2017-2026, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */

import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';

const CurveFittingQueryParameters = QueryStringMachine.getAll( {

  // Determines whether dragged points should be placed such that their coordinates are rounded to the nearest 1.
  // For internal use only, not public facing.
  snapToGrid: {
    type: 'boolean',
    defaultValue: false
  }

} );

export default CurveFittingQueryParameters;
