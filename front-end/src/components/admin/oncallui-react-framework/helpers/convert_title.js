import _ from 'lodash';

export default function convertTitle(text) { return _.startCase(_.camelCase(text));}