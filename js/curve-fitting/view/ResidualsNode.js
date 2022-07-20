// Copyright 2017-2022, University of Colorado Boulder

/**
 * Residuals node in 'Curve Fitting' simulation that is responsible for the vertical lines between the data points and the curve
 *
 * @author Martin Veillette (Berea College)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

// constants
const RESIDUAL_OPTIONS = { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 };

class ResidualsNode extends Node {

  /**
   * @param {Points} points
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( points, curve, residualsVisibleProperty, modelViewTransform ) {

    super();

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS ) );

    // create and add path for all residual lines
    const residualsPath = new Path( null, RESIDUAL_OPTIONS );
    this.addChild( residualsPath );

    /**
     * Updates the paths for all the residuals from all the points
     */
    const updateResiduals = () => {

      // invalidate shape
      residualsPath.shape = null;

      if ( residualsVisibleProperty.value && curve.isCurvePresent() ) {
        const residualsShape = new Shape();

        // updates the path residuals which are the vertical lines connecting data points to curve
        points.getRelevantPoints().forEach( point => {
          residualsShape.moveToPoint( point.positionProperty.value );
          residualsShape.verticalLineTo( curve.getYValueAt( point.positionProperty.value.x ) );
        } );
        residualsPath.shape = modelViewTransform.modelToViewShape( residualsShape );

      }
    };

    // unlink and removeListener unnecessary: present for the lifetime of the simulation
    residualsVisibleProperty.link( updateResiduals );
    curve.orderProperty.link( updateResiduals );
    curve.updateCurveEmitter.addListener( updateResiduals );
  }

}

curveFitting.register( 'ResidualsNode', ResidualsNode );
export default ResidualsNode;