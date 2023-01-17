// Copyright 2015-2023, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import CurveFittingQueryParameters from '../CurveFittingQueryParameters.js';
import BucketNode from './BucketNode.js';
import ControlPanels from './ControlPanels.js';
import CurveNode from './CurveNode.js';
import DeviationsAccordionBox from './DeviationsAccordionBox.js';
import EquationAccordionBox from './EquationAccordionBox.js';
import GraphAreaNode from './GraphAreaNode.js';
import ResidualsNode from './ResidualsNode.js';

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
      25.5 // set empirically, see https://github.com/phetsims/curve-fitting/issues/157
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
            directionToPush = new Vector2( dotRandom.nextDouble(), dotRandom.nextDouble() );
          }
          directionToPush.setMagnitude( 0.05 );
          point.positionProperty.value = point.positionProperty.value.plus( directionToPush );
        } );
      } while ( pointsUnder.length > 0 );

      // Rounds point positions if snapToGrid is enabled
      if ( CurveFittingQueryParameters.snapToGrid ) {
        model.points.forEach( point => {
          point.positionProperty.value = new Vector2(
            Utils.toFixedNumber( point.positionProperty.value.x, 0 ),
            Utils.toFixedNumber( point.positionProperty.value.y, 0 )
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

curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );
export default CurveFittingScreenView;