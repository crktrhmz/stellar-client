var sc = angular.module('stellarClient');

sc.controller('TradingCtrl', function($scope, session, singletonPromise, Trading) {
  // Populate the currency lists from the wallet's gateways.
  var gateways = session.get('wallet').get('mainData', 'gateways', []);
  var gatewayCurrencies = _.flatten(_.pluck(gateways, 'currencies'));
  $scope.currencies = [{currency:"STR"}].concat(gatewayCurrencies);
  $scope.currencyNames = _.uniq(_.pluck($scope.currencies, 'currency'));

  $scope.tradeOperation = 'buy';
  $scope.currentOrderBook = null;

  $scope.baseAmount = 0;
  $scope.unitPrice = 0;
  $scope.counterAmount = 0;

  $scope.baseCurrency = {
    currency: $scope.currencyNames[0],
    issuer: null
  };

  $scope.counterCurrency = {
    currency: $scope.currencyNames[1],
    issuer: null
  };

  $scope.$watch('baseCurrency', setCurrentOrderBook, true);
  $scope.$watch('counterCurrency', setCurrentOrderBook, true);

  $scope.$watch('baseAmount', calculateCounterAmount);
  $scope.$watch('unitPrice', calculateCounterAmount);

  $scope.getIssuers = function(currency) {
    var currencies = _.filter($scope.currencies, {currency: currency.currency});
    var issuers = _.pluck(currencies, 'issuer');

    currency.issuer = issuers[0];
    return issuers;
  };

  $scope.hasIssuer = function(currencyName) {
    return currencyName && currencyName !== 'STR';
  };

  $scope.validOrderBook = function() {
    if (_.isEmpty($scope.baseCurrency)) { return false; }
    if (_.isEmpty($scope.counterCurrency)) { return false; }

    if ($scope.baseCurrency === $scope.counterCurrency) { return false; }

    return true;
  };

  $scope.createOffer = singletonPromise(function(e) {
    var offerPromise;

    if ($scope.tradeOperation === 'buy') {
      offerPromise = $scope.currentOrderBook.buy($scope.baseAmount, $scope.counterAmount);
    } else {
      offerPromise = $scope.currentOrderBook.sell($scope.baseAmount, $scope.counterAmount);
    }
    
    return offerPromise
      .catch(function(e) {
        // TODO: Handle errors.
      });
  });

  function calculateCounterAmount() {
    $scope.counterAmount = new BigNumber($scope.baseAmount).times($scope.unitPrice).toString();
  }

  function setCurrentOrderBook() {
    if ($scope.currentOrderBook) {
      var baseCurrencyUnchanged = _.isEqual($scope.currentOrderBook.baseCurrency, $scope.baseCurrency);
      var counterCurrencyUnchanged = _.isEqual($scope.currentOrderBook.counterCurrency, $scope.payableCurrency);

      if (baseCurrencyUnchanged && counterCurrencyUnchanged) {
        return;
      } else {
        $scope.currentOrderBook.destroy();
      }
    }

    if ($scope.validOrderBook()) {
      $scope.currentOrderBook = Trading.getOrderBook(_.pick($scope, 'baseCurrency', 'counterCurrency'));
      $scope.currentOrderBook.subscribe();
    } else {
      $scope.currentOrderBook = null;
    }
  }


      $scope.currentOrderBook.destroy();
    }

    $scope.currentOrderBook = Trading.getOrderBook(_.pick($scope, 'baseCurrency', 'counterCurrency'));
    $scope.currentOrderBook.subscribe();
  }
});
