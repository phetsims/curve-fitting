// Copyright 2019-2022, University of Colorado Boulder

/**
 * An enumeration of valid ways to fit a curve to a set of points
 * BEST means that the best fit is found
 * ADJUSTABLE means that a user is controlling the fit of the curve
 *
 * @author Saurabh Totey
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import curveFitting from '../../curveFitting.js';

const FitType = EnumerationDeprecated.byKeys( [ 'ADJUSTABLE', 'BEST' ] );

curveFitting.register( 'FitType', FitType );
export default FitType;