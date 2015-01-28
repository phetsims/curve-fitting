//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var ControlMenuNode = require( 'CURVE_FITTING/curve-fitting/view/ControlMenuNode' );
  var DeviationsNode = require( 'CURVE_FITTING/curve-fitting/view/DeviationsNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );

  // constants
  var PADDING = 10;
  var SIM_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @constructor
   */
  function CurveFittingView( CurveFittingModel ) {
    ScreenView.call( this, { renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );

    // add deviations node
    var deviationsNode = new DeviationsNode( CurveFittingModel.property( 'isDeviationPanelExpanded' ) );
    deviationsNode.centerX = deviationsNode.width / 2 + PADDING;
    deviationsNode.centerY = deviationsNode.height / 2 + PADDING;
    this.addChild( deviationsNode );

    // add control menu node
    var controlMenuNode = new ControlMenuNode( CurveFittingModel );
    controlMenuNode.centerX = SIM_BOUNDS.width - PADDING - controlMenuNode.width / 2;
    controlMenuNode.centerY = PADDING + controlMenuNode.height / 2;
    this.addChild( controlMenuNode );

    // add graph area node
    var graphAreaNode = new GraphAreaNode();
    graphAreaNode.centerX = controlMenuNode.bounds.minX - graphAreaNode.width / 2 - PADDING;
    graphAreaNode.centerY = graphAreaNode.height / 2 + PADDING;
    this.addChild( graphAreaNode );

    // add bucket node
    var bucketNode = new BucketNode();
    bucketNode.centerX = bucketNode.width / 2 + 20;
    bucketNode.centerY = SIM_BOUNDS.height - bucketNode.height - 5;
    this.addChild( bucketNode );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: CurveFittingModel.reset.bind( CurveFittingModel )
    } );
    resetAllButton.centerX = SIM_BOUNDS.width - resetAllButton.width / 2;
    resetAllButton.centerY = SIM_BOUNDS.height - resetAllButton.height / 2;
    resetAllButton.scale( 0.75 );
    this.addChild( resetAllButton );
  }

  return inherit( ScreenView, CurveFittingView );
} );