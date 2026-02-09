package tree_sitter_pluto_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-pluto"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pluto.Language())
	if language == nil {
		t.Errorf("Error loading Pluto grammar")
	}
}
