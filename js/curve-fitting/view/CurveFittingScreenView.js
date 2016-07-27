// Copyright 2015-2016, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var BucketAndGraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/BucketAndGraphAreaNode' );
  var ControlPanels = require( 'CURVE_FITTING/curve-fitting/view/ControlPanels' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var DeviationsAccordionBox = require( 'CURVE_FITTING/curve-fitting/view/DeviationsAccordionBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Vector2 = require( 'DOT/Vector2' );

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
    var viewProperties = new PropertySet( {
      deviationsAccordionBoxExpanded: true,  //TODO layout is hosed if this is initially false
      equationPanelExpanded: true,
      residualsVisible: false,
      valuesVisible: false
    } );

    // Deviations accordion box, at left of screen
    var deviationsAccordionBox = new DeviationsAccordionBox( viewProperties.deviationsAccordionBoxExpandedProperty, model.curve, {
      left: 10,
      top: 10
    } );

    // All other controls, at right of screen
    var controlPanels = new ControlPanels( model.curve, model.orderProperty, model.fitProperty,
      model.curve.isVisibleProperty, viewProperties.residualsVisibleProperty, viewProperties.valuesVisibleProperty, {
        right: this.layoutBounds.right - 10,
        top: deviationsAccordionBox.top
      } );

    // create a model view transform
    var graphAreaWidth = controlPanels.left - deviationsAccordionBox.right - GRAPH_PADDING_LEFT_RIGHT * 2;
    var graphCenterX = 0.5 * (controlPanels.left + deviationsAccordionBox.right);
    var graphCenterY = this.layoutBounds.centerY;
    var scale = graphAreaWidth / GRAPH_MODEL_BOUNDS.width; //TODO computation mixes view and model coordinate frames!
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ), new Vector2( graphCenterX, graphCenterY ), scale );

    // create bucket and graph area node
    var bucketAndGraphAreaNode = new BucketAndGraphAreaNode(
      model.curve, model.bucket, model.orderProperty, model.graphModelBounds,
      viewProperties.residualsVisibleProperty, viewProperties.valuesVisibleProperty, viewProperties.equationPanelExpandedProperty,
      modelViewTransform );

    // create reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        viewProperties.reset();
      }
    } );
    resetAllButton.scale( 0.75 );
    resetAllButton.right = controlPanels.right;
    resetAllButton.bottom = this.layoutBounds.bottom - 15;

    // add the children to the scene graph
    this.addChild( deviationsAccordionBox );
    this.addChild( controlPanels );
    this.addChild( bucketAndGraphAreaNode );
    this.addChild( resetAllButton );
  }

  curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );

  return inherit( ScreenView, CurveFittingScreenView );
} );