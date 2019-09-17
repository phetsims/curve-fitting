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
  const CurveFittingQueryParameters = require( 'CURVE_FITTING/curve-fitting/CurveFittingQueryParameters' );
  const CurveNode = require( 'CURVE_FITTING/curve-fitting/view/CurveNode' );
  const DeviationsAccordionBox = require( 'CURVE_FITTING/curve-fitting/view/DeviationsAccordionBox' );
  const EquationAccordionBox = require( 'CURVE_FITTING/curve-fitting/view/EquationAccordionBox' );
  const GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ResidualsNode = require( 'CURVE_FITTING/curve-fitting/view/ResidualsNode' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const EXPAND_COLLAPSE_PUSH_BOUNDS_DILATION = 0.45; // in model coordinates

  class CurveFittingScreenView extends ScreenView {

    /**
     * @param {CurveFittingModel} model
     */
    constructor( model ) {

      super();

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

      // create a model view transform, graph is centered and fills the ScreenView height
      const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        new Vector2( 0, 0 ),
        new Vector2( this.layoutBounds.centerX, this.layoutBounds.centerY ),
        25.5 //TODO compute this
      );

      // create the graph area node - responsible for the rendering of the axes, ticks and background.
      const graphAreaNode = new GraphAreaNode( modelViewTransform );

      const graphViewBounds = modelViewTransform.modelToViewBounds( CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS );

      // deviations accordion box, at left of screen
      const deviationsAccordionBox = new DeviationsAccordionBox(
        deviationsAccordionBoxExpandedProperty,
        model.points,
        model.curve.chiSquaredProperty,
        model.curve.rSquaredProperty,
        curveVisibleProperty, {
          centerX: this.layoutBounds.left + ( graphAreaNode.left - this.layoutBounds.left ) / 2,
          top: graphViewBounds.minY
        }
      );

      // all other controls, at right of screen
      const controlPanels = new ControlPanels(
        model.sliderPropertyArray,
        model.orderProperty,
        model.fitProperty,
        curveVisibleProperty,
        residualsVisibleProperty,
        valuesVisibleProperty, {
          centerX: this.layoutBounds.right - ( this.layoutBounds.right - graphAreaNode.right ) / 2,
          top: graphViewBounds.minY
        } );

      // create the equation node (accordion box) in the upper left corner of the graph
      const equationBoxLeft = modelViewTransform.modelToViewX( -10 ) + 10;
      const equationAccordionBox = new EquationAccordionBox(
        model.curve,
        model.orderProperty,
        equationPanelExpandedProperty,
        curveVisibleProperty,
        {
          left: equationBoxLeft,
          top: modelViewTransform.modelToViewY( 10 ) + 10,
          equationNodeMaxWidth: modelViewTransform.modelToViewX( 10 ) - equationBoxLeft - 65
        }
      );

      // create the panel that serves as an opaque background for the equationAccordionBox; see #126
      // no dispose or removeListener necessary because equationAccordionBox is present for the lifetime of the sim
      const graphEquationBackground = new Rectangle( 0, 0, 0, 0, 0, 0, {
        cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
        fill: 'white'
      } );
      equationAccordionBox.updatedEmitter.addListener( () => {
        graphEquationBackground.visible = equationAccordionBox.visible;
        graphEquationBackground.rectBounds = equationAccordionBox.bounds;
      } );

      // Whenever the curve becomes visible, points below the EquationAccordionBox's expand/collapse button get
      // pushed out from under the button; see #131
      const bumpOutPointsUnderExpandCollapseButton = () => {
        if ( !curveVisibleProperty.value ) {
          return;
        }

        const pointPushBounds = modelViewTransform.viewToModelBounds(
          graphAreaNode.globalToLocalBounds(
            equationAccordionBox.expandCollapseButton.localToGlobalBounds(
              equationAccordionBox.expandCollapseButton.localBounds
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

        // Rounds point positions if snapToGrid is enabled
        if ( CurveFittingQueryParameters.snapToGrid ) {
          model.points.forEach( point => {
            point.positionProperty.value = new Vector2(
              Util.toFixedNumber( point.positionProperty.value.x, 0 ),
              Util.toFixedNumber( point.positionProperty.value.y, 0 )
            );
          } );
        }
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
          controlPanels.reset();
          deviationsAccordionBoxExpandedProperty.reset();
          equationPanelExpandedProperty.reset();
          residualsVisibleProperty.reset();
          valuesVisibleProperty.reset();
          curveVisibleProperty.reset();
        },
        right: this.layoutBounds.right - CurveFittingConstants.SCREEN_VIEW_X_MARGIN,
        bottom: this.layoutBounds.bottom - CurveFittingConstants.SCREEN_VIEW_Y_MARGIN
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
      this.addChild( equationAccordionBox );
    }

  }

  return curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );
} );
