// Copyright 2015-2016, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var BucketAndGraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/BucketAndGraphAreaNode' );
  var ControlPanels = require( 'CURVE_FITTING/curve-fitting/view/ControlPanels' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var DeviationsAccordionBox = require( 'CURVE_FITTING/curve-fitting/view/DeviationsAccordionBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Vector2 = require( 'DOT/Vector2' );
  var EquationGraphPanelNode = require( 'CURVE_FITTING/curve-fitting/view/EquationGraphPanelNode' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );

  // constants
  var GRAPH_PADDING_LEFT_RIGHT = 15;
  var GRAPH_MODEL_BOUNDS = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

  /**
   * @param {CurveFittingModel} model
   * @constructor
   */
  function CurveFittingScreenView( model ) {

    ScreenView.call( this, CurveFittingConstants.SCREEN_VIEW_OPTIONS );

    // view-specific Properties
    // @public {Property.<boolean>} determines visibility of the "Deviations" accordion box (upper left hand side panel)
    var deviationsAccordionBoxExpandedProperty = new BooleanProperty( true );

    // @public {Property.<boolean>} determines expansion status of the equation node on graph
    var equationPanelExpandedProperty = new BooleanProperty( true );

    // @public {Property.<boolean>} determines visibility of residuals
    var residualsVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} determines visibility of value
    var valuesVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} determines visibility of the curve fit
    var curveVisibleProperty = new BooleanProperty( false );

    // Deviations accordion box, at left of screen
    var deviationsAccordionBox = new DeviationsAccordionBox( deviationsAccordionBoxExpandedProperty, model.curve, {
      left: 10,
      top: 10
    } );

    // All other controls, at right of screen
    var controlPanels = new ControlPanels( model.curve, model.orderProperty, model.fitProperty,
      curveVisibleProperty, residualsVisibleProperty, valuesVisibleProperty, {
        right: this.layoutBounds.right - 10,
        top: deviationsAccordionBox.top
      } );

    // create a model view transform
    var graphAreaWidth = controlPanels.left - deviationsAccordionBox.right - GRAPH_PADDING_LEFT_RIGHT * 2;
    var graphCenterX = 0.5 * (controlPanels.left + deviationsAccordionBox.right);
    var graphCenterY = this.layoutBounds.centerY;
    var scale = graphAreaWidth / GRAPH_MODEL_BOUNDS.width;
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ), new Vector2( graphCenterX, graphCenterY ), scale );

    // create the graph area node - responsible for the rendering of the curves, as well as the axes and background.
    var graphAreaNode = new GraphAreaNode( model.curve, residualsVisibleProperty, curveVisibleProperty, model.graphModelBounds, modelViewTransform );

    // create the equation node (accordion box) in the upper left corner of the graph
    var equationGraphPanelNode = new EquationGraphPanelNode( model.curve, model.orderProperty, equationPanelExpandedProperty, curveVisibleProperty );

    // layout of equation inset on graph
    equationGraphPanelNode.left = graphAreaNode.left + 10;
    equationGraphPanelNode.top = graphAreaNode.top + 10;

    // create bucket and graph area node
    var bucketAndGraphAreaNode = new BucketAndGraphAreaNode(
      model.curve.points, model.bucket,
      residualsVisibleProperty, valuesVisibleProperty,
      modelViewTransform );

    // create reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
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
    this.addChild( bucketAndGraphAreaNode );
    this.addChild( resetAllButton );
  }

  curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );

  return inherit( ScreenView, CurveFittingScreenView );
} );