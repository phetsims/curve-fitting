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
  var DeviationsPanel = require( 'CURVE_FITTING/curve-fitting/view/DeviationsPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var PADDING_LEFT_RIGHT = 10;
  var PADDING_TOP_BOTTOM = 25;
  var GRAPH_PADDING_LEFT_RIGHT = 15;
  var SIM_BOUNDS = CurveFittingConstants.SIM_BOUNDS;
  var GRAPH_MODEL_BOUNDS = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

  /**
   * @param {CurveFittingModel} model
   * @constructor
   */
  function CurveFittingScreenView( model ) {

    ScreenView.call( this, { layoutBounds: SIM_BOUNDS } );

    // view-specific Properties
    var viewProperties = new PropertySet( {
      deviationsPanelExpanded: true,  //TODO layout is hosed if this is initially false
      equationPanelExpanded: true
    } );

    var deviationsPanel = new DeviationsPanel( viewProperties.deviationsPanelExpandedProperty, model.curve );

    var controlPanels = new ControlPanels( model.curve, model.orderProperty, model.fitProperty,
    model.curve.isVisibleProperty, model.areResidualsVisibleProperty, model.areValuesVisibleProperty );

    //TODO handle layout in constructor options
    // layout the nodes
    deviationsPanel.left = PADDING_LEFT_RIGHT;
    deviationsPanel.top = PADDING_TOP_BOTTOM;
    controlPanels.right = SIM_BOUNDS.width - PADDING_LEFT_RIGHT;
    controlPanels.top = deviationsPanel.top;

    // create a model view transform
    var graphAreaWidth = controlPanels.left - deviationsPanel.right - GRAPH_PADDING_LEFT_RIGHT * 2;
    var graphCenterX = 0.5 * (controlPanels.left + deviationsPanel.right);
    var graphCenterY = SIM_BOUNDS.centerY;
    var scale = graphAreaWidth / GRAPH_MODEL_BOUNDS.width;
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ), new Vector2( graphCenterX, graphCenterY ), scale );

    // create bucket and graph area node
    var bucketAndGraphAreaNode = new BucketAndGraphAreaNode(
      model.curve, model.bucket, model.orderProperty, model.graphModelBounds,
      model.areResidualsVisibleProperty, model.areValuesVisibleProperty, viewProperties.equationPanelExpandedProperty,
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
    resetAllButton.bottom = SIM_BOUNDS.height - PADDING_TOP_BOTTOM;

    // add the children to the scene graph
    this.addChild( deviationsPanel );
    this.addChild( controlPanels );
    this.addChild( bucketAndGraphAreaNode );
    this.addChild( resetAllButton );
  }

  curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );

  return inherit( ScreenView, CurveFittingScreenView );
} );