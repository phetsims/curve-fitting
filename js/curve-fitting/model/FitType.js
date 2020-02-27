// Copyright 2019, University of Colorado Boulder

/**
 * An enumeration of valid ways to fit a curve to a set of points
 * BEST means that the best fit is found
 * ADJUSTABLE means that a user is controlling the fit of the curve
 *
 * @author Saurabh Totey
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import curveFitting from '../../curveFitting.js';

const FitType = Enumeration.byKeys( [ 'ADJUSTABLE', 'BEST' ] );

curveFitting.register( 'FitType', FitType );
export default FitType;