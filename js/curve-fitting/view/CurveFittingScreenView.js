// Copyright 2015-2019, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
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
  const GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  const GraphEquationAccordionBox = require( 'CURVE_FITTING/curve-fitting/view/GraphEquationAccordionBox' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ResidualsNode = require( 'CURVE_FITTING/curve-fitting/view/ResidualsNode' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const GRAPH_PADDING_LEFT_RIGHT = 15;
  const EXPAND_COLLAPSE_PUSH_BOUNDS_DILATION = 0.45; // in model coordinates

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

      // deviations accordion box, at left of screen
      const deviationsAccordionBox = new DeviationsAccordionBox(
        deviationsAccordionBoxExpandedProperty,
        model.points,
        model.curve.chiSquaredProperty,
        model.curve.rSquaredProperty,
        curveVisibleProperty,
        { left: 10, top: 10 }
      );

      // all other controls, at right of screen
      const controlPanels = new ControlPanels(
        model.sliderPropertyArray,
        model.orderProperty,
        model.fitProperty,
        curveVisibleProperty,
        residualsVisibleProperty,
        valuesVisibleProperty,
        { right: this.layoutBounds.right - 10, top: deviationsAccordionBox.top }
      );

      // create a model view transform
      const graphAreaWidth = controlPanels.left - deviationsAccordionBox.right - GRAPH_PADDING_LEFT_RIGHT * 2;
      const graphCenterX = 0.5 * ( controlPanels.left + deviationsAccordionBox.right );
      const graphCenterY = graphAreaWidth / 2 + deviationsAccordionBox.top;
      const scale = graphAreaWidth / CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS.width;
      const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        new Vector2( 0, 0 ),
        new Vector2( graphCenterX, graphCenterY ),
        scale
      );

      // create the graph area node - responsible for the rendering of the axes, ticks and background.
      const graphAreaNode = new GraphAreaNode( modelViewTransform );

      // create the equation node (accordion box) in the upper left corner of the graph
      const equationBoxLeft = modelViewTransform.modelToViewX( -10 ) + 10;
      const graphEquationAccordionBox = new GraphEquationAccordionBox(
        model.curve,
        model.orderProperty,
        equationPanelExpandedProperty,
        curveVisibleProperty,
        {
          left: equationBoxLeft,
          top: modelViewTransform.modelToViewY( 10 ) + 10,
          equationNodeMaxWidth: modelViewTransform.modelToViewX( 10 ) - equationBoxLeft - 45
        }
      );

      // create the panel that serves as an opaque background for the graphEquationAccordionBox; see #126
      const graphEquationBackground = new Rectangle( 0, 0, 0, 0, 0, 0, {
        cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
        fill: 'white'
      } );
      graphEquationAccordionBox.updatedEmitter.addListener( () => {
        graphEquationBackground.visible = graphEquationAccordionBox.visible;
        graphEquationBackground.rectBounds = graphEquationAccordionBox.bounds;
      } );

      // Whenever the curve becomes visible, points below the GraphEquationAccordionBox's expand/collapse button get
      // pushed out from under the button; see #131
      const bumpOutPointsUnderExpandCollapseButton = () => {
        if ( !curveVisibleProperty.value ) {
          return;
        }

        const pointPushBounds = modelViewTransform.viewToModelBounds(
          graphAreaNode.globalToLocalBounds(
            graphEquationAccordionBox.expandCollapseButton.localToGlobalBounds(
              graphEquationAccordionBox.expandCollapseButton.localBounds
            )
          )
        ).dilated( EXPAND_COLLAPSE_PUSH_BOUNDS_DILATION );

        // Gets points that intersect with the expand/collapse button and pushes them until they don't intersect
        let pointsUnder = [];
        do {
          pointsUnder = model.points.filter( point => pointPushBounds.containsPoint( point.positionProperty.value ) );
          pointsUnder.forEach( point => {
            let directionToPush = point.positionProperty.value.minus( pointPushBounds.center );
            while ( directionToPush.equals( Vector2.ZERO ) ) {
              directionToPush = new Vector2( phet.joist.random.nextDouble(), phet.joist.random.nextDouble() );
            }
            directionToPush.setMagnitude( 0.05 );
            point.positionProperty.value = point.positionProperty.value.plus( directionToPush );
          } );
        } while ( pointsUnder.length > 0 );
      };

      // unlink unnecessary, present for the lifetime of the sim
      curveVisibleProperty.link( bumpOutPointsUnderExpandCollapseButton );

      // create the curve and the residual lines
      const curveNode = new CurveNode(
        model.curve,
        curveVisibleProperty,
        modelViewTransform
      );

      // create the residual lines
      const residualsNode = new ResidualsNode(
        model.points,
        model.curve,
        residualsVisibleProperty,
        modelViewTransform
      );

      // create bucket
      const bucketNode = new BucketNode(
        model.points,
        bumpOutPointsUnderExpandCollapseButton,
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
        },
        scale: 0.75,
        right: controlPanels.right,
        bottom: this.layoutBounds.bottom - 15
      } );

      // add the children to the scene graph
      this.addChild( deviationsAccordionBox );
      this.addChild( controlPanels );
      this.addChild( graphAreaNode );
      this.addChild( resetAllButton );
      this.addChild( graphEquationBackground );
      this.addChild( curveNode );
      this.addChild( residualsNode );
      this.addChild( bucketNode );
      this.addChild( graphEquationAccordionBox );
    }

  }

  return curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );
} );
