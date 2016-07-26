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
  var ControlMenuNode = require( 'CURVE_FITTING/curve-fitting/view/ControlMenuNode' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var DeviationsPanel = require( 'CURVE_FITTING/curve-fitting/view/DeviationsPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
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
   * @param {CurveFittingModel} curveFittingModel
   * @constructor
   */
  function CurveFittingScreenView( curveFittingModel ) {
    ScreenView.call( this, { layoutBounds: SIM_BOUNDS } );

    // create deviations node
    var deviationsPanel = new DeviationsPanel( curveFittingModel.isDeviationPanelExpandedProperty, curveFittingModel.curve );

    // create control menu node
    var controlMenuNode = new ControlMenuNode( curveFittingModel );

    // layout the nodes
    deviationsPanel.left = PADDING_LEFT_RIGHT;
    deviationsPanel.top = PADDING_TOP_BOTTOM;
    controlMenuNode.right = SIM_BOUNDS.width - PADDING_LEFT_RIGHT;
    controlMenuNode.top = deviationsPanel.top;

    // create a model view transform
    var graphAreaWidth = controlMenuNode.left - deviationsPanel.right - GRAPH_PADDING_LEFT_RIGHT * 2;
    var graphCenterX = 0.5 * (controlMenuNode.left + deviationsPanel.right);
    var graphCenterY = SIM_BOUNDS.centerY;
    var scale = graphAreaWidth / GRAPH_MODEL_BOUNDS.width;
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ), new Vector2( graphCenterX, graphCenterY ), scale );

    // create bucket and graph area node
    var bucketAndGraphAreaNode = new BucketAndGraphAreaNode( curveFittingModel, modelViewTransform );

    // create reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        // all properties are in the model (even visibilities)
        curveFittingModel.reset();
      }
    } );
    resetAllButton.scale( 0.75 );
    resetAllButton.right = controlMenuNode.right;
    resetAllButton.bottom = SIM_BOUNDS.height - PADDING_TOP_BOTTOM;

    // add the children to the scene graph
    this.addChild( deviationsPanel );
    this.addChild( controlMenuNode );
    this.addChild( bucketAndGraphAreaNode );
    this.addChild( resetAllButton );

  }

  curveFitting.register( 'CurveFittingScreenView', CurveFittingScreenView );

  return inherit( ScreenView, CurveFittingScreenView );
} );