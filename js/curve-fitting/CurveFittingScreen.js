// Copyright 2015-2020, University of Colorado Boulder

/**
 * Main screen in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import curveFitting from '../curveFitting.js';
import CurveFittingModel from './model/CurveFittingModel.js';
import CurveFittingScreenView from './view/CurveFittingScreenView.js';

class CurveFittingScreen extends Screen {

  constructor() {
    super(
      () => new CurveFittingModel(),
      model => new CurveFittingScreenView( model ),
      { backgroundColorProperty: new Property( 'rgb( 187, 230, 246 )' ) }
    );
  }

}

curveFitting.register( 'CurveFittingScreen', CurveFittingScreen );
export default CurveFittingScreen;