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
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VStrut = require( 'SCENERY/nodes/VStrut' );

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
        xTextOptions: { font: NORMAL_FONT },
        maxWidth: 130
      }, options );

      super( { align: 'bottom', maxWidth: options.maxWidth } );

      // @private {Property.<number>}
      this.orderProperty = orderProperty;

      // @private {Array.<Text>}
      this.signTextNodes = [];

      // @private {Array.<Text>}
      this.coefficientTextNodes = [];

      // @private {Array.<RichText>}
      this.xVariableTextNodes = [];

      const mathFontXString = `<i style='font-family:${MATH_FONT.family}'>${symbolXString}</i>`;

      // initializes this.signTextNodes, this.coefficientTextNodes, and this.xVariableTextNodes
      for ( let i = 0; i <= CurveFittingConstants.MAX_ORDER_OF_FIT; i++ ) {
        this.signTextNodes.push( new Text( '', options.coefficientSignTextOptions ) );
        this.coefficientTextNodes.push( new Text( '', options.coefficientTextOptions ) );
        if ( i === 0 ) {
          this.xVariableTextNodes.push( new Text( '', options.xTextOptions ) );
        }
        else if ( i === 1 ) {
          this.xVariableTextNodes.push( new RichText( mathFontXString, options.xTextOptions ) );
        }
        else {
          this.xVariableTextNodes.push( new RichText( `${mathFontXString}<sup>${i}</sup>`, options.xTextOptions ) );
        }
      }

      // @private {Array.<Node>} all potential children of this node
      this.allPotentialChildren = [];

      // initializes this.allPotentialChildren; this.allPotentialChildren SHOULD NOT CHANGE after this
      const yNode = new Text( `${symbolYString} ${MathSymbols.EQUAL_TO} `, options.yEqualsTextOptions );
      this.allPotentialChildren.push( yNode );
      for ( let i = CurveFittingConstants.MAX_ORDER_OF_FIT; i >= 0; i-- ) {
        this.allPotentialChildren.push( this.signTextNodes[ i ] );
        this.allPotentialChildren.push( this.coefficientTextNodes[ i ] );

        // arbitrary spacing to separate coefficient from variable to be more aesthetically pleasing
        this.allPotentialChildren.push( new HStrut( 1 ) );
        this.allPotentialChildren.push( this.xVariableTextNodes[ i ] );
      }

      // adds a VStrut to this.allPotentialChildren that is always visible
      // VStrut is the same height as a text with an exponent (in this case, the x^2 term)
      // this ensures that even if no terms with exponents are visible, this node will still have the same height; see #124
      this.allPotentialChildren.push( new VStrut( this.xVariableTextNodes[ 2 ].height ) );

      // makes an array of symbols as the initial coefficients; '+' signs are inserted before each coefficient in the array
      const initialCoefficients = _.flatMap(
        [ symbolDString, symbolCString, symbolBString, symbolAString ],
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
        this.updateChildrenAndVisibilities();
      };
      this.orderProperty.link( visibilityUpdater );
      this.disposeVisibilityUpdater = () => { this.orderProperty.unlink( visibilityUpdater ); };

    }

    /**
     * Removes a leading '+' if there is one and removes all invisible children
     * Turns a leading '-' into a unary minus for the coefficient
     * Is in its own separate method so that it can be called when coefficients are changed or when the equation's order is changed
     * @private
     */
    updateChildrenAndVisibilities() {

      // removes the leading coefficient's sign
      // if it is a +, it is gone
      // if it is a -, it is turned into a unary - on the leading coefficient
      const leadingSignTextNode = this.signTextNodes[ this.orderProperty.value ];
      leadingSignTextNode.visible = false;
      const leadingCoefficient = this.coefficientTextNodes[ this.orderProperty.value ];
      if ( leadingSignTextNode.text === ` ${MathSymbols.MINUS} ` && !leadingCoefficient.text.includes( MathSymbols.UNARY_MINUS ) ) {
        leadingCoefficient.text = MathSymbols.UNARY_MINUS + leadingCoefficient.text;
      }

      // makes unnecessary HStruts invisible; HStruts are unnecessary when their proceeding variable texts are invisible
      for ( let i = 0; i < this.allPotentialChildren.length - 1; i++ ) {
        const child = this.allPotentialChildren[ i ];
        if ( !( child instanceof HStrut ) ) {
          continue;
        }
        child.visible = this.allPotentialChildren[ i + 1 ].visible;
      }

      // sets all children of this node to all the visible potential children
      this.children = this.allPotentialChildren.filter( child => child.visible );
    }

    /**
     * @param {Array.<string>} coefficientsArray - an array of interleaved signs and coefficients to set for this equation by ascending order
     * @public
     */
    setCoefficients( coefficientsArray ) {

      assert && assert( coefficientsArray.length >= 2 * ( this.orderProperty.value + 1 ), 'Not enough coefficients for each term in the equation.' );

      for ( let i = 0; i < coefficientsArray.length; i += 2 ) {
        this.signTextNodes[ i / 2 ].text = ` ${coefficientsArray[ i ]} `;
        this.coefficientTextNodes[ i / 2 ].text = coefficientsArray[ i + 1 ];
      }

      this.updateChildrenAndVisibilities();

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

  curveFitting.register( 'EquationNode', EquationNode );

  return EquationNode;
} );