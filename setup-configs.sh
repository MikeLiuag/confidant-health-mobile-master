#!/usr/bin/env bash
if [[ -z "$1" ]]; then
  echo "No Environment specified"
  exit 1
fi
if [[ -z "${REACT_CONFIG_USER}" ]]; then
  echo "Configuration Variables not set"
  exit 1
fi
if [[ -z "${REACT_CONFIG_PASS}" ]]; then
  echo "Configuration Variables not set"
  exit 1
fi

if [[ $1 = "qa" ]]; then
  URL="https://qa.confidantdemos.com/rest/config/confidant-health-mobile/"$1
elif [[ $1 = "dev" ]]; then
  URL="https://dev.confidantdemos.com/rest/config/confidant-health-mobile/"$1
elif [[ $1 = "staging" ]]; then
  URL="https://staging.confidantdemos.com/rest/config/confidant-health-mobile/"$1
elif [[ $1 = "sit1" ]]; then
  URL="https://sit1.confidantdemos.com/rest/config/confidant-health-mobile/"$1
elif [[ $1 = "sit2" ]]; then
  URL="https://sit2.confidantdemos.com/rest/config/confidant-health-mobile/"$1
elif [[ $1 = "sit3" ]]; then
  URL="https://sit3.confidantdemos.com/rest/config/confidant-health-mobile/"$1
elif [[ $1 = "prod" ]]; then
  URL="https://app.confidanthealth.com/rest/config/confidant-health-mobile/"$1
else
  echo "Configurations not supported for environment "$1
  exit 1
fi
echo "Cleaning existing keys & configurations"
rm -rf configurations.json
rm -rf .env
echo "Requesting Configurations for environment "$1
if curl $URL --fail -u ${REACT_CONFIG_USER}:${REACT_CONFIG_PASS} -o configurations.json; then
  echo $1" Environment Configurations fetched"
  touch .env
  node expose-configs.js $1 configurations.json
else
  echo "Failed to Fetch Environment Configurations for "$1
fi


