// Copyright 2002-2014, University of Colorado Boulder

/**
 * Deviations node in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and menu dialog.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalCheckBoxGroup = require( 'SUN/VerticalCheckBoxGroup' );

  // strings
  var LinearString = require( 'string!CURVE_FITTING/linear' );
  var QuadraticString = require( 'string!CURVE_FITTING/quadratic' );
  var ResidualsString = require( 'string!CURVE_FITTING/residuals' );
  var ValuesString = require( 'string!CURVE_FITTING/values' );

  // constants
  var PANEL_MARGIN = 10;
  var FONT = new PhetFont( 14 );

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @param {Object} options for graph node
   * @constructor
   */
  function ControlMenuNode( CurveFittingModel, options ) {
    Node.call( this, options );

    this.addChild( new Panel( new VerticalCheckBoxGroup( [{
      content: new Text( LinearString, {font: FONT} ),
      property: CurveFittingModel.property( 'isCurve' )
    }, {
      content: new Text( ResidualsString, {font: FONT} ),
      property: CurveFittingModel.property( 'isResiduals' )
    }, {
      content: new Text( ValuesString, {font: FONT} ),
      property: CurveFittingModel.property( 'isValues' )
    }
    ], {spacing: 5, boxWidth: 15} ), {
      cornerRadius: 3,
      fill: 'white',
      xMargin: PANEL_MARGIN,
      yMargin: PANEL_MARGIN
    } ) );

  }

  return inherit( Node, ControlMenuNode );
} );