// Copyright 2015-2019, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  const ControlPanels = require( 'CURVE_FITTING/curve-fitting/view/ControlPanels' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const CurveNode = require( 'CURVE_FITTING/curve-fitting/view/CurveNode' );
  const DeviationsAccordionBox = require( 'CURVE_FITTING/curve-fitting/view/DeviationsAccordionBox' );
  const EquationGraphPanelNode = require( 'CURVE_FITTING/curve-fitting/view/EquationGraphPanelNode' );
  const GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ResidualsNode = require( 'CURVE_FITTING/curve-fitting/view/ResidualsNode' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const GRAPH_PADDING_LEFT_RIGHT = 15;

  class CurveFittingScreenView extends ScreenView {

    /**
     * @param {CurveFittingModel} model
     */
    constructor( model ) {

      super( CurveFittingConstants.SCREEN_VIEW_OPTIONS );

      // view-specific Properties
      // @public {Property.<boolean>} determines visibility of the "Deviations" accordion box (upper left hand side panel)
      const deviationsAccordionBoxExpandedProperty = new BooleanProperty( true );

      // @public {Property.<boolean>} determines expansion status of the equation node on graph
      const equationPanelExpandedProperty = new BooleanProperty( true );

      // @public {Property.<boolean>} determines visibility of residuals
      const residualsVisibleProperty = new BooleanProperty( false );

      // @public {Property.<boolean>} determines visibility of values
      const valuesVisibleProperty = new BooleanProperty( false );

      // @public {Property.<boolean>} determines visibility of the curve fit
      const curveVisibleProperty = new BooleanProperty( false );

      // Deviations accordion box, at left of screen
      const deviationsAccordionBox = new DeviationsAccordionBox( deviationsAccordionBoxExpandedProperty,
          model.points, model.curve.chiSquaredProperty, model.curve.rSquaredProperty, curveVisibleProperty, {
            left: 10,
            top: 10
          } );

      // All other controls, at right of screen
      const controlPanels = new ControlPanels(
          model.sliderPropertyArray,
          model.orderProperty,
          model.fitProperty,
          curveVisibleProperty,
          residualsVisibleProperty,
          valuesVisibleProperty,
          {
            right: this.layoutBounds.right - 10,
            top: deviationsAccordionBox.top
          } );

      // create a model view transform
      const graphAreaWidth = controlPanels.left - deviationsAccordionBox.right - GRAPH_PADDING_LEFT_RIGHT * 2;
      const graphCenterX = 0.5 * (controlPanels.left + deviationsAccordionBox.right);
      const graphCenterY = graphAreaWidth / 2 + deviationsAccordionBox.top;
      const scale = graphAreaWidth / CurveFittingConstants.GRAPH_MODEL_BOUNDS.width;
      const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
          new Vector2( 0, 0 ),
          new Vector2( graphCenterX, graphCenterY ),
          scale );

      // create the graph area node - responsible for the rendering of the axes, ticks and background.
      const graphAreaNode = new GraphAreaNode( modelViewTransform );

      // create the equation node (accordion box) in the upper left corner of the graph
      const equationGraphPanelNode = new EquationGraphPanelNode(
          model.curve.getCoefficients.bind( model.curve ),
          model.curve.updateCurveEmitter,
          model.orderProperty,
          equationPanelExpandedProperty,
          curveVisibleProperty );

      // create the curve and the residual lines
      const curveNode = new CurveNode(
          model.curve,
          curveVisibleProperty,
          modelViewTransform );

      // create the residual lines
      const residualsNode = new ResidualsNode(
          model.points,
          model.curve,
          residualsVisibleProperty,
          modelViewTransform );

      // layout of equation inset on graph
      equationGraphPanelNode.left = graphAreaNode.left + 10;
      equationGraphPanelNode.top = graphAreaNode.top + 10;

      // create bucket (and handle responsibilities associated with points)
      const bucketNode = new BucketNode(
          model.points,
          residualsVisibleProperty,
          valuesVisibleProperty,
          modelViewTransform
      );

      // create reset all button
      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
          deviationsAccordionBoxExpandedProperty.reset();
          equationPanelExpandedProperty.reset();
          residualsVisibleProperty.reset();
          valuesVisibleProperty.reset();
          curveVisibleProperty.reset();
        }
      } );
      resetAllButton.scale( 0.75 );
      resetAllButton.right = controlPanels.right;
      resetAllButton.bottom = this.layoutBounds.bottom - 15;

      // add the children to the scene graph
      this.addChild( deviationsAccordionBox );
      this.addChild( controlPanels );
      this.addChild( graphAreaNode );
      this.addChild( equationGraphPanelNode );
      this.addChild( resetAllButton );
      this.addChild( curveNode );
      this.addChild( residualsNode );
      this.addChild( bucketNode ); // must be last in the z-ordering
    }

  }

  curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );

  return CurveFittingScreenView;
} );