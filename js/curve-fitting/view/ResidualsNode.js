// Copyright 2017, University of Colorado Boulder

/**
 * Residuals node in 'Curve Fitting' simulation that is responsible for the vertical lines between the data points and the curve
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const RESIDUAL_OPTIONS = { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 };

  /**
   * @param {Points} points
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ResidualsNode( points, curve, residualsVisibleProperty, modelViewTransform ) {

    Node.call( this );

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( CurveFittingConstants.GRAPH_MODEL_BOUNDS ) );

    // create and add path for all residual lines
    const residualsPath = new Path( null, RESIDUAL_OPTIONS );
    this.addChild( residualsPath );

    /**
     * Updates the paths for all the residuals from all the points
     */
    const updateResiduals = () => {
      if ( residualsVisibleProperty.value && curve.isCurvePresent() ) {

        const pointsOnGraph = points.getPointsOnGraph();
        const residualsShape = new Shape();
        // updates the path residuals which are the vertical lines connecting data points to curve
        pointsOnGraph.forEach( point => {
          residualsShape.moveToPoint( point.positionProperty.value );
          residualsShape.verticalLineTo( curve.getYValueAt( point.positionProperty.value.x ) );
        } );
        residualsPath.setShape( modelViewTransform.modelToViewShape( residualsShape ) );

      }
      else {
        residualsPath.setShape( null );
      }
    };

    residualsVisibleProperty.link( updateResiduals );
    curve.orderProperty.link( updateResiduals );
    curve.updateCurveEmitter.addListener( updateResiduals );
  }

  curveFitting.register( 'ResidualsNode', ResidualsNode );

  return inherit( Node, ResidualsNode );
} );