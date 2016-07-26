// Copyright 2016, University of Colorado Boulder

/**
 * Control panel for selecting view options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var CheckBox = require( 'SUN/CheckBox' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var curveString = require( 'string!CURVE_FITTING/curve' );
  var residualsString = require( 'string!CURVE_FITTING/residuals' );
  var valuesString = require( 'string!CURVE_FITTING/values' );

  // constants
  var CHECK_BOX_OPTIONS = { boxWidth: 16 }; //TODO move to constants
  var FONT = new PhetFont( 12 ); // TODO move to constants

  /**
   * @constructor
   */
  function ViewOptionsPanel( curveVisibleProperty, residualsVisibleProperty, valuesVisibleProperty, options ) {

    var residualsCheckBox = new CheckBox( new Text( residualsString, { font: FONT } ), residualsVisibleProperty, CHECK_BOX_OPTIONS );

    var checkBoxGroup = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        new CheckBox( new Text( curveString, { font: FONT } ), curveVisibleProperty, CHECK_BOX_OPTIONS ),
        residualsCheckBox,
        new CheckBox( new Text( valuesString, { font: FONT } ), valuesVisibleProperty, CHECK_BOX_OPTIONS )
      ]
    } );

    Panel.call( this, checkBoxGroup, options );

    curveVisibleProperty.link( function( isCurveVisible ) {
      residualsCheckBox.enabled = isCurveVisible;
      if ( !isCurveVisible ) {
        residualsVisibleProperty.set( false );
      }
    } );
  }

  curveFitting.register( 'ViewOptionsPanel', ViewOptionsPanel );

  return inherit( Panel, ViewOptionsPanel );
} );
