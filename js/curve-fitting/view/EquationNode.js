// Copyright 2019, University of Colorado Boulder

/**
 * EquationNode is used to handle displaying equations in a uniform manner
 *
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  const symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  const symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  const symbolDString = require( 'string!CURVE_FITTING/symbol.d' );
  const symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  const symbolYString = require( 'string!CURVE_FITTING/symbol.y' );

  // constants
  const NORMAL_FONT = new PhetFont( 12 );
  const MATH_FONT = new MathSymbolFont( 12 );

  class EquationNode extends HBox {

    /**
     * @param {Property.<number>} orderProperty - a property that reflects what order this equation should be
     * @param {Object} [options]
     */
    constructor( orderProperty, options ) {

      options = _.extend( {
        yEqualsTextOptions: { font: NORMAL_FONT },
        coefficientSignTextOptions: { font: NORMAL_FONT },
        coefficientTextOptions: { font: NORMAL_FONT, fill: 'blue' },
        xTextOptions: { font: MATH_FONT }
      }, options );

      super( options );

      // @private {Property.<number>}
      this.orderProperty = orderProperty;

      // @private {Array.<Text>}
      this.signTextNodes = [];

      // @private {Array.<Text>}
      this.coefficientTextNodes = [];

      // @private {Array.<RichText>}
      this.xVariableTextNodes = [];

      // initializes this.signTextNodes and this.coefficientTextNodes
      for ( let i = 0; i <= CurveFittingConstants.MAX_ORDER_OF_FIT; i++ ) {
        this.signTextNodes.push( new Text( '', options.coefficientSignTextOptions ) );
        this.coefficientTextNodes.push( new Text( '', options.coefficientTextOptions ) );
        if ( i === 0 ) {
          this.xVariableTextNodes.push( new Text( '', options.xTextOptions ) );
        }
        else if ( i === 1 ) {
          this.xVariableTextNodes.push( new Text( symbolXString, options.xTextOptions ) );
        }
        else {
          this.xVariableTextNodes.push( new RichText( symbolXString + '<sup>' + i + '</sup>', options.xTextOptions ) );
        }
      }

      // adds all relevent children to this node
      const yNode = new Text( symbolYString + ' ' + MathSymbols.EQUAL_TO + ' ', options.yEqualsTextOptions );
      this.addChild( yNode );
      for ( let i = CurveFittingConstants.MAX_ORDER_OF_FIT; i >= 0; i-- ) {
        this.addChild( this.signTextNodes[ i ] );
        this.addChild( this.coefficientTextNodes[ i ] );
        this.addChild( this.xVariableTextNodes[ i ] );
      }

      // makes an array of symbols as the initial coefficients; '+' signs are inserted before each coefficient in the array
      const initialCoefficients = [ symbolDString, symbolCString, symbolBString, symbolAString ].flatMap(
        coefficient => [ MathSymbols.PLUS, coefficient ]
      );
      this.setCoefficients( initialCoefficients );

      // links the visibility of terms to the order of the equation
      const visibilityUpdater = order => {
        for ( let i = 0; i <= CurveFittingConstants.MAX_ORDER_OF_FIT; i++ ) {
          const isVisible = i <= order;
          this.signTextNodes[ i ].visible = isVisible;
          this.coefficientTextNodes[ i ].visible = isVisible;
          this.xVariableTextNodes[ i ].visible = isVisible;
        }
        this.removeLeadingPlus();
      };
      this.orderProperty.link( visibilityUpdater );
      this.disposeVisibilityUpdater = () => { this.orderProperty.unlink( visibilityUpdater ); };

    }

    /**
     * Removes a leading '+' if there is one
     * Is in its own separate method so that it can be called when coefficients are changed or when the equation's order is changed
     * @private
     */
    removeLeadingPlus() {

      // the leading coefficient's sign is visible when it is not '+'
      this.signTextNodes[ this.orderProperty.value + 1 ].visible = this.signTextNodes[ this.orderProperty.value + 1 ].text !== MathSymbols.PLUS;
    }

    /**
     * @param {Array.<string>} coefficientsArray - an array of interleaved signs and coefficients to set for this equation by ascending order
     * @public
     */
    setCoefficients( coefficientsArray ) {

      assert && assert( coefficientsArray.length >= 2 * ( this.orderProperty.value + 1 ), 'Not enough coefficients for each term in the equation.' );

      for ( let i = 0; i < coefficientsArray.length; i += 2 ) {
        this.signTextNodes[ i / 2 ] = coefficientsArray[ i ];
        this.coefficientTextNodes[ i / 2 ] = coefficientsArray[ i + 1];
      }

      this.removeLeadingPlus();

    }

    /**
     * @override
     * @public
     */
    dispose() {
      this.disposeVisibilityUpdater();
      super.dispose();
    }

  }

  curveFitting.register( 'EquationNode', EquationNode);

  return EquationNode;
} );